import {
  DefineStepCallback,
  IScope,
  StepBlock,
  StepCallback,
  StepMatcher,
} from "./common.types";
import { StepDefinition } from "./StepDefinition";

interface IDefineStepCallbacks {
  defineGiven: DefineStepCallback;
  defineWhen: DefineStepCallback;
  defineThen: DefineStepCallback;
}

declare type DefineStepsCallback = (
  defineStepCallbacks: IDefineStepCallbacks
) => void;

export const defineSteps = (globalScopes: IScope[], defineStepsCallback: DefineStepsCallback) => {
  const stepDefinitions: StepDefinition[] = [];

  const defineStep = (scopes: IScope[], match: StepMatcher, block: StepBlock, callback: StepCallback) => {
    stepDefinitions.push(new StepDefinition(scopes.concat(globalScopes), match, block, callback));
  };

  const defineStepCallbacks: IDefineStepCallbacks = {
    defineGiven: (match, callback, scopes = []) => defineStep(scopes, match, 'given', callback),
    defineWhen: (match, callback, scopes = []) => defineStep(scopes, match, 'when', callback),
    defineThen: (match, callback, scopes = []) => defineStep(scopes, match, 'then', callback),
  };

  defineStepsCallback(defineStepCallbacks);
  return stepDefinitions;
};