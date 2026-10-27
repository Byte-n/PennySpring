import {
  tabBarCompositionDemoTitle,
  TabBarCompositionDemo,
} from './composition';
import { tabBarDarkDemoTitle, TabBarDarkDemo } from './dark';
import { tabBarSizeDemoTitle, TabBarSizeDemo } from './size';
import { tabBarStatesDemoTitle, TabBarStatesDemo } from './states';

export const tabBarDemos = [
  { id: 'size', title: tabBarSizeDemoTitle, Component: TabBarSizeDemo },
  { id: 'states', title: tabBarStatesDemoTitle, Component: TabBarStatesDemo },
  {
    id: 'composition',
    title: tabBarCompositionDemoTitle,
    Component: TabBarCompositionDemo,
  },
  { id: 'dark', title: tabBarDarkDemoTitle, Component: TabBarDarkDemo },
];
