import { progressBarDemoTitle, ProgressBarDemo } from './bar';
import {
  progressCircleDemoTitle,
  ProgressCircleDemo,
} from './circle';
import { progressDarkDemoTitle, ProgressDarkDemo } from './dark';
import {
  progressStatesDemoTitle,
  ProgressStatesDemo,
} from './states';

export const progressDemos = [
  { id: 'bar', title: progressBarDemoTitle, Component: ProgressBarDemo },
  {
    id: 'states',
    title: progressStatesDemoTitle,
    Component: ProgressStatesDemo,
  },
  {
    id: 'circle',
    title: progressCircleDemoTitle,
    Component: ProgressCircleDemo,
  },
  { id: 'dark', title: progressDarkDemoTitle, Component: ProgressDarkDemo },
];
