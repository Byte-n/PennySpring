import { switchBasicDemoTitle, SwitchBasicDemo } from './basic';
import {
  switchSizeAndStateDemoTitle,
  SwitchSizeAndStateDemo,
} from './size-and-state';

export const switchDemos = [
  { id: 'basic', title: switchBasicDemoTitle, Component: SwitchBasicDemo },
  {
    id: 'size-and-state',
    title: switchSizeAndStateDemoTitle,
    Component: SwitchSizeAndStateDemo,
  },
];
