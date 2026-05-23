import { radioBasicDemoTitle, RadioBasicDemo } from './basic';
import {
  radioButtonTypeAndStateDemoTitle,
  RadioButtonTypeAndStateDemo,
} from './button-type-and-state';
import { radioGroupDemoTitle, RadioGroupDemo } from './group';

export const radioDemos = [
  { id: 'basic', title: radioBasicDemoTitle, Component: RadioBasicDemo },
  {
    id: 'button-type-and-state',
    title: radioButtonTypeAndStateDemoTitle,
    Component: RadioButtonTypeAndStateDemo,
  },
  { id: 'group', title: radioGroupDemoTitle, Component: RadioGroupDemo },
];
