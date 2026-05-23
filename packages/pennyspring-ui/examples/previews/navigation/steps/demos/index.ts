import { stepsControlledDemoTitle, StepsControlledDemo } from './controlled';
import {
  stepsReadonlyAndDisabledItemDemoTitle,
  StepsReadonlyAndDisabledItemDemo,
} from './readonly-and-disabled-item';
import {
  stepsSizeAndStatusDemoTitle,
  StepsSizeAndStatusDemo,
} from './size-and-status';

export const stepsDemos = [
  {
    id: 'controlled',
    title: stepsControlledDemoTitle,
    Component: StepsControlledDemo,
  },
  {
    id: 'readonly-and-disabled-item',
    title: stepsReadonlyAndDisabledItemDemoTitle,
    Component: StepsReadonlyAndDisabledItemDemo,
  },
  {
    id: 'size-and-status',
    title: stepsSizeAndStatusDemoTitle,
    Component: StepsSizeAndStatusDemo,
  },
];
