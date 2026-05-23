import { ellipsisDirectionDemoTitle, EllipsisDirectionDemo } from './direction';
import {
  ellipsisExpandAndCollapseDemoTitle,
  EllipsisExpandAndCollapseDemo,
} from './expand-and-collapse';
import {
  ellipsisRowsAndSizeDemoTitle,
  EllipsisRowsAndSizeDemo,
} from './rows-and-size';

export const ellipsisDemos = [
  {
    id: 'direction',
    title: ellipsisDirectionDemoTitle,
    Component: EllipsisDirectionDemo,
  },
  {
    id: 'expand-and-collapse',
    title: ellipsisExpandAndCollapseDemoTitle,
    Component: EllipsisExpandAndCollapseDemo,
  },
  {
    id: 'rows-and-size',
    title: ellipsisRowsAndSizeDemoTitle,
    Component: EllipsisRowsAndSizeDemo,
  },
];
