import {
  dividerHorizontalDemoTitle,
  DividerHorizontalDemo,
} from './horizontal';
import { dividerSizeDemoTitle, DividerSizeDemo } from './size';
import { dividerVerticalDemoTitle, DividerVerticalDemo } from './vertical';

export const dividerDemos = [
  {
    id: 'horizontal',
    title: dividerHorizontalDemoTitle,
    Component: DividerHorizontalDemo,
  },
  { id: 'size', title: dividerSizeDemoTitle, Component: DividerSizeDemo },
  {
    id: 'vertical',
    title: dividerVerticalDemoTitle,
    Component: DividerVerticalDemo,
  },
];
