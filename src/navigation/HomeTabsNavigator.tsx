import React from 'react';

import { ChartTabScreen } from '../screens/home/tabs/ChartTabScreen';
import { DetailTabScreen } from '../screens/home/tabs/DetailTabScreen';
import { HOME_TAB_ROUTES } from './routes';
import { TabScreen, TopTabNavigator } from '../component/TopTabNavigator';

interface HomeTabsNavigatorProps {
  leftActions?: React.ReactNode;
}

const HOME_TAB_SCREENS: readonly TabScreen[] = [
  {
    name: HOME_TAB_ROUTES.DetailTab,
    label: '明细',
    component: DetailTabScreen,
  },
  {
    name: HOME_TAB_ROUTES.ChartTab,
    label: '图表',
    component: ChartTabScreen,
  },
];

export function HomeTabsNavigator({ leftActions }: HomeTabsNavigatorProps) {
  return (
    <TopTabNavigator
      leftActions={leftActions}
      screens={HOME_TAB_SCREENS}
    />
  );
}
