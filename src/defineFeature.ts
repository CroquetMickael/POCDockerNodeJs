import { defineFeature as defineFeatureJest, loadFeature } from "jest-cucumber";

var callsites = require("callsites");
var path = require("path");
var glob = require("glob");

import {
  ParsedScenario,
  ParsedScenarioOutline,
} from "jest-cucumber/dist/src/models";
import { DefineScenarioFunction } from "jest-cucumber/dist/src/feature-definition-creation";
import { StepBlock } from "./common.types";
import { formatStepMatchingError } from "./errors";
import { StepDefinition } from "./StepDefinition";

const stepPool: StepDefinition[] = [];
let isLoaded = false;
export const defineFeature = (cheminFichier: string, isCheminRelatif = true) => {
  const infoAppelant = callsites.default()[1];
  const fichierAppelant = (infoAppelant && infoAppelant.getFileName()) || '';
  const dossierAppelant = path.dirname(fichierAppelant);
  const cheminAbsolu = isCheminRelatif ? `${dossierAppelant}${path.sep}${cheminFichier}` : cheminFichier;

  const feature = loadFeature(cheminAbsolu, {
    loadRelativePath: false,
    errors: {
      missingScenarioInStepDefinitions: true,
      missingStepInStepDefinitions: true,
      missingScenarioInFeature: true,
      missingStepInFeature: true,
    },
  });

  const getNewBlock = (stepKeyword: string, currentBlock: StepBlock): StepBlock =>
    ['given', 'when', 'then'].includes(stepKeyword) ? (stepKeyword as StepBlock) : currentBlock;

  defineFeatureJest(feature, defineScenarioJest => {
    const defineScenarios = (scenarios: ParsedScenario[] | ParsedScenarioOutline[]) => {
      scenarios.forEach(scenario => {
        const tags = feature.tags.concat(scenario.tags);
        const availableSteps = stepPool.filter(step => step.hasMatchingScopes(feature.title, scenario.title, tags));
        const scenarioContext = {};

        let defineScenario: DefineScenarioFunction = defineScenarioJest;
        if (scenario.tags.includes('@only')) {
          defineScenario = defineScenarioJest.only;
        }
        if (scenario.tags.includes('@ignore') || scenario.tags.includes('@skip')) {
          defineScenario = defineScenarioJest.skip;
        }

        let currentBlock: StepBlock = 'given';
        defineScenario(scenario.title, stepsDefinitionCallBack => {
          scenario.steps.forEach(step => {
            currentBlock = getNewBlock(step.keyword, currentBlock);

            const stepDefinitions = availableSteps.filter(stepDefinition => {
              if (stepDefinition.block !== currentBlock) {
                return false;
              }
              const matchResult = step.stepText.match(stepDefinition.match);
              return matchResult && matchResult[0] === step.stepText;
            });

            if (stepDefinitions.length !== 1) {
              const matchingError = formatStepMatchingError(cheminAbsolu, feature, scenario, step, stepDefinitions);
              throw new Error(matchingError);
            }

            const { selectJestCallback, match, callback } = stepDefinitions[0];
            const defineStepJest = selectJestCallback(stepsDefinitionCallBack);
            defineStepJest(match, callback(scenarioContext));
          });
        });
      });
    };

    defineScenarios(feature.scenarios);
    defineScenarios(feature.scenarioOutlines);
  });
};

export const loadSteps = (dossier = './src/__features__') => {
  if (isLoaded) {
    return;
  }
  stepPool.length = 0;
  const patternFichier = `${dossier}/**/*.stepdefinitions.js`;
  const fichiers = glob.sync(patternFichier);
  fichiers.forEach(cheminFichier => {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const { stepDefinitions } = require(path.resolve(cheminFichier)) as { stepDefinitions: StepDefinition[] };
    if (!stepDefinitions) {
      console.error(`Le fichier ${cheminFichier} n'exporte pas de variable stepDefinitions`);
      return;
    }
    stepDefinitions.forEach(stepDefinition => {
      stepDefinition.cheminFichier = cheminFichier;
      stepPool.push(stepDefinition);
    });
  });
  isLoaded = true;
};
