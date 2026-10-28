import {
  stepsDarkDemoTitle,
  StepsDarkDemo,
} from './dark';
import {
  stepsReadonlyAndDisabledDemoTitle,
  StepsReadonlyAndDisabledDemo,
} from './readonly-and-disabled';
import { stepsSizeDemoTitle, StepsSizeDemo } from './size';
import { stepsStatesDemoTitle, StepsStatesDemo } from './states';

export const stepsDemos = [
  { id: 'size', title: stepsSizeDemoTitle, Component: StepsSizeDemo },
  { id: 'states', title: stepsStatesDemoTitle, Component: StepsStatesDemo },
  {
    id: 'readonly-and-disabled',
    title: stepsReadonlyAndDisabledDemoTitle,
    Component: StepsReadonlyAndDisabledDemo,
  },
  { id: 'dark', title: stepsDarkDemoTitle, Component: StepsDarkDemo },
];
