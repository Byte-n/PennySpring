import {
  wheelGroupBasicDemoTitle,
  WheelGroupBasicDemo,
} from './basic';
import {
  wheelGroupFitContainerDemoTitle,
  WheelGroupFitContainerDemo,
} from './fit-container';
import {
  wheelGroupStateDemoTitle,
  WheelGroupStateDemo,
} from './state';

export const wheelGroupDemos = [
  {
    id: 'basic',
    title: wheelGroupBasicDemoTitle,
    Component: WheelGroupBasicDemo,
  },
  {
    id: 'fit-container',
    title: wheelGroupFitContainerDemoTitle,
    Component: WheelGroupFitContainerDemo,
  },
  {
    id: 'state',
    title: wheelGroupStateDemoTitle,
    Component: WheelGroupStateDemo,
  },
];
