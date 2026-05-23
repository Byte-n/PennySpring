import { resultSizeDemoTitle, ResultSizeDemo } from './size';
import { resultStatusDemoTitle, ResultStatusDemo } from './status';
import { resultWithExtraDemoTitle, ResultWithExtraDemo } from './with-extra';

export const resultDemos = [
  { id: 'size', title: resultSizeDemoTitle, Component: ResultSizeDemo },
  { id: 'status', title: resultStatusDemoTitle, Component: ResultStatusDemo },
  {
    id: 'with-extra',
    title: resultWithExtraDemoTitle,
    Component: ResultWithExtraDemo,
  },
];
