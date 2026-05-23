import { checkboxBasicDemoTitle, CheckboxBasicDemo } from './basic';
import {
  checkboxButtonTypeAndStateDemoTitle,
  CheckboxButtonTypeAndStateDemo,
} from './button-type-and-state';
import { checkboxGroupDemoTitle, CheckboxGroupDemo } from './group';

export const checkboxDemos = [
  { id: 'basic', title: checkboxBasicDemoTitle, Component: CheckboxBasicDemo },
  {
    id: 'button-type-and-state',
    title: checkboxButtonTypeAndStateDemoTitle,
    Component: CheckboxButtonTypeAndStateDemo,
  },
  { id: 'group', title: checkboxGroupDemoTitle, Component: CheckboxGroupDemo },
];
