import React from 'react';
import { Icon } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';
import { ChartBarIcon, ListBulletsIcon } from 'phosphor-react-native';

import { ChartTabScreen } from '../screens/home/tabs/ChartTabScreen';
import { DetailTabScreen } from '../screens/home/tabs/DetailTabScreen';
import { HOME_TAB_ROUTES } from './routes';
import {
  type TabScreen,
  TopTabNavigator,
  type TopTabNavigatorStyles,
} from '../component/TopTabNavigator';
import { ThemeSwitchButton } from '../screens/home/ThemeSwitchButton.tsx';
import { HomeHeaderLeft } from '../screens/home/HomeHeaderLeft.tsx';

interface HomeTabsNavigatorProps {
  openDrawer: VoidFunction;
}

const HOME_TAB_SCREENS: readonly TabScreen[] = [
  {
    name: HOME_TAB_ROUTES.DetailTab,
    label: <Icon icon={ListBulletsIcon} size="large" weight="bold" />,
    labelText: '明细',
    component: DetailTabScreen,
  },
  {
    name: HOME_TAB_ROUTES.ChartTab,
    label: <Icon icon={ChartBarIcon} size="large" weight="bold" />,
    labelText: '图表',
    component: ChartTabScreen,
  },
];

const useStyles = createUseSheetStyle(() => ({
  sideActions: {
    flex: 0,
  },
}));

export function HomeTabsNavigator({ openDrawer }: HomeTabsNavigatorProps) {
  const styles = useStyles();
  const navigatorStyles: TopTabNavigatorStyles = {
    headerBar: {
      leftActions: styles.sideActions,
      rightActions: styles.sideActions,
    },
  };

  return (
    <TopTabNavigator
      leftActions={<HomeHeaderLeft onMenuPress={openDrawer} />}
      rightActions={<ThemeSwitchButton />}
      screens={HOME_TAB_SCREENS}
      styles={navigatorStyles}
    />
  );
}
