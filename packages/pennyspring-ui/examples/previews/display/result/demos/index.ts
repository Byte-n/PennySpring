import {
  resultContainerDemoTitle,
  ResultContainerDemo,
} from './container';
import { resultDarkDemoTitle, ResultDarkDemo } from './dark';
import { resultSizeDemoTitle, ResultSizeDemo } from './size';
import { resultStatusDemoTitle, ResultStatusDemo } from './status';

export const resultDemos = [
  { id: 'status', title: resultStatusDemoTitle, Component: ResultStatusDemo },
  { id: 'size', title: resultSizeDemoTitle, Component: ResultSizeDemo },
  {
    id: 'container',
    title: resultContainerDemoTitle,
    Component: ResultContainerDemo,
  },
  { id: 'dark', title: resultDarkDemoTitle, Component: ResultDarkDemo },
];
