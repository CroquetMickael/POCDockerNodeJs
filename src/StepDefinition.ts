import {
  IScope,
  JestCallbackSelector,
  StepBlock,
  StepCallback,
} from "./common.types";

const getJestCallbackSelector = (block: StepBlock): JestCallbackSelector => {
  switch (block) {
    case 'given':
      return ({ given }) => given;
    case 'when':
      return ({ when }) => when;
    case 'then':
      return ({ then }) => then;
    default:
      throw Error(`"${block}" n'est pas un block valide : given | when | then`);
  }
};

const matchScope = (scope: IScope, feature: string, scenario: string, tags: string[]) => {
  const matchFeature = !scope.feature || scope.feature === feature;
  const matchScenario = !scope.scenario || scope.scenario === scenario;
  const matchTags = !scope.tag || tags.includes(`@${scope.tag.toLowerCase()}`);
  return matchFeature && matchScenario && matchTags;
};

export class StepDefinition {
  readonly scopes: IScope[];
  readonly match: string | RegExp;
  readonly block: StepBlock;
  readonly callback: StepCallback;
  readonly selectJestCallback: JestCallbackSelector;

  cheminFichier: string;

  constructor(
    scopes: IScope[],
    match: string | RegExp,
    block: StepBlock,
    callback: StepCallback
  ) {
    this.scopes = scopes;
    this.match = match;
    this.block = block;
    this.callback = callback;
    this.selectJestCallback = getJestCallbackSelector(block);
  }

  hasMatchingScopes = (feature: string, scenario: string, tags: string[]) =>
    this.scopes.some((scope) => matchScope(scope, feature, scenario, tags));
}
