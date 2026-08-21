import React from 'react';
import { createUseSheetStyle } from '@pennyspring/theme';

import { ChartTabScreen } from '../screens/home/tabs/ChartTabScreen';
import { DetailTabScreen } from '../screens/home/tabs/DetailTabScreen';
import { HOME_TAB_ROUTES } from './routes';
import {
  type TabScreen,
  TopTabNavigator,
  type TopTabNavigatorStyles,
} from '../component/TopTabNavigator';

interface HomeTabsNavigatorProps {
  leftActions?: React.ReactNode;
  rightActions?: React.ReactNode;
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

const useStyles = createUseSheetStyle(() => ({
  sideActions: {
    flex: 0,
  },
}));

export function HomeTabsNavigator({
  leftActions,
  rightActions,
}: HomeTabsNavigatorProps) {
  const styles = useStyles();
  const navigatorStyles: TopTabNavigatorStyles = {
    headerBar: {
      leftActions: styles.sideActions,
      rightActions: styles.sideActions,
    },
  };

  return (
    <TopTabNavigator
      leftActions={leftActions}
      rightActions={rightActions}
      screens={HOME_TAB_SCREENS}
      styles={navigatorStyles}
    />
  );
}
