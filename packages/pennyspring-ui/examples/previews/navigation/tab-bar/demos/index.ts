import {
  tabBarControlledAndOnPressDemoTitle,
  TabBarControlledAndOnPressDemo,
} from './controlled-and-on-press';
import {
  tabBarSizeDisabledAndSafeAreaInsetBottomDemoTitle,
  TabBarSizeDisabledAndSafeAreaInsetBottomDemo,
} from './size-disabled-and-safe-area-inset-bottom';

export const tabBarDemos = [
  {
    id: 'controlled-and-on-press',
    title: tabBarControlledAndOnPressDemoTitle,
    Component: TabBarControlledAndOnPressDemo,
  },
  {
    id: 'size-disabled-and-safe-area-inset-bottom',
    title: tabBarSizeDisabledAndSafeAreaInsetBottomDemoTitle,
    Component: TabBarSizeDisabledAndSafeAreaInsetBottomDemo,
  },
];
