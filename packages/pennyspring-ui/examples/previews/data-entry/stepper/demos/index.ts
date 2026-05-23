import {
  stepperControlledDemoTitle,
  StepperControlledDemo,
} from './controlled';
import {
  stepperRangeAndStateDemoTitle,
  StepperRangeAndStateDemo,
} from './range-and-state';

export const stepperDemos = [
  {
    id: 'controlled',
    title: stepperControlledDemoTitle,
    Component: StepperControlledDemo,
  },
  {
    id: 'range-and-state',
    title: stepperRangeAndStateDemoTitle,
    Component: StepperRangeAndStateDemo,
  },
];
