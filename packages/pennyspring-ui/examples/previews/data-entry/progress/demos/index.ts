import { progressBarDemoTitle, ProgressBarDemo } from './bar';
import { progressCircleDemoTitle, ProgressCircleDemo } from './circle';

export const progressDemos = [
  { id: 'bar', title: progressBarDemoTitle, Component: ProgressBarDemo },
  {
    id: 'circle',
    title: progressCircleDemoTitle,
    Component: ProgressCircleDemo,
  },
];
