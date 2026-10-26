import { listBasicDemoTitle, ListBasicDemo } from './basic';
import { listCollapsibleDemoTitle, ListCollapsibleDemo } from './collapsible';
import { listStatesDemoTitle, ListStatesDemo } from './states';

export const listDemos = [
  { id: 'basic', title: listBasicDemoTitle, Component: ListBasicDemo },
  {
    id: 'collapsible',
    title: listCollapsibleDemoTitle,
    Component: ListCollapsibleDemo,
  },
  { id: 'states', title: listStatesDemoTitle, Component: ListStatesDemo },
];
