import { tabsBasicDemoTitle, TabsBasicDemo } from './basic';
import {
  tabsControlledBlockDemoTitle,
  TabsControlledBlockDemo,
} from './controlled-block';
import {
  tabsSizeAndDisabledDemoTitle,
  TabsSizeAndDisabledDemo,
} from './size-and-disabled';

export const tabsDemos = [
  { id: 'basic', title: tabsBasicDemoTitle, Component: TabsBasicDemo },
  {
    id: 'controlled-block',
    title: tabsControlledBlockDemoTitle,
    Component: TabsControlledBlockDemo,
  },
  {
    id: 'size-and-disabled',
    title: tabsSizeAndDisabledDemoTitle,
    Component: TabsSizeAndDisabledDemo,
  },
];
