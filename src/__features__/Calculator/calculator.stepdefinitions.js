import { defineSteps } from "../../index";

export const stepDefinitions = defineSteps(
  [{ feature: "Simple Calculator", tag: "feature" }],
  ({ defineGiven, defineThen, defineWhen }) => {
    defineGiven(/^number "(.*)"$/, (scenarioContext) => (number) => {
      if (scenarioContext.number) {
        scenarioContext.number.push(number);
      } else {
      scenarioContext.number = [number];
      }
    });

    defineWhen("I add them", (scenarioContext) => (number) => {
      scenarioContext.result =
        +scenarioContext.number[0] + +scenarioContext.number[1];
    });

    defineWhen("I multiple them", (scenarioContext) => (number) => {
      scenarioContext.result =
        +scenarioContext.number[0] * +scenarioContext.number[1];
    });

    defineThen(
      /^the result should be "(.*)"$/,
      (scenarioContext) => (number) => {
        expect(scenarioContext.result).toBe(+number);
      }
    );
  }
);
