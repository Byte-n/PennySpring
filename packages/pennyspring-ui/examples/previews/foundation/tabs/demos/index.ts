import { tabsDarkDemoTitle, TabsDarkDemo } from './dark';
import { tabsLayoutsDemoTitle, TabsLayoutsDemo } from './layouts';
import { tabsSizeDemoTitle, TabsSizeDemo } from './size';
import { tabsStatesDemoTitle, TabsStatesDemo } from './states';

export const tabsDemos = [
  { id: 'size', title: tabsSizeDemoTitle, Component: TabsSizeDemo },
  { id: 'states', title: tabsStatesDemoTitle, Component: TabsStatesDemo },
  { id: 'layouts', title: tabsLayoutsDemoTitle, Component: TabsLayoutsDemo },
  { id: 'dark', title: tabsDarkDemoTitle, Component: TabsDarkDemo },
];
