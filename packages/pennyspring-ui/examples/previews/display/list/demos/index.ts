import { listAmountDemoTitle, ListAmountDemo } from './amount';
import { listCollapsibleDemoTitle, ListCollapsibleDemo } from './collapsible';
import { listRowsDemoTitle, ListRowsDemo } from './rows';
import { listStatesDemoTitle, ListStatesDemo } from './states';

export const listDemos = [
  { id: 'rows', title: listRowsDemoTitle, Component: ListRowsDemo },
  { id: 'amount', title: listAmountDemoTitle, Component: ListAmountDemo },
  {
    id: 'collapsible',
    title: listCollapsibleDemoTitle,
    Component: ListCollapsibleDemo,
  },
  { id: 'states', title: listStatesDemoTitle, Component: ListStatesDemo },
];
