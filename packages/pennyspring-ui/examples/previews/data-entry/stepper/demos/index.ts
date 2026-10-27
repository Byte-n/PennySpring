import {
  stepperCompositionDemoTitle,
  StepperCompositionDemo,
} from './composition';
import { stepperDarkDemoTitle, StepperDarkDemo } from './dark';
import { stepperSizeDemoTitle, StepperSizeDemo } from './size';
import { stepperStatesDemoTitle, StepperStatesDemo } from './states';

export const stepperDemos = [
  { id: 'size', title: stepperSizeDemoTitle, Component: StepperSizeDemo },
  { id: 'states', title: stepperStatesDemoTitle, Component: StepperStatesDemo },
  {
    id: 'composition',
    title: stepperCompositionDemoTitle,
    Component: StepperCompositionDemo,
  },
  { id: 'dark', title: stepperDarkDemoTitle, Component: StepperDarkDemo },
];
