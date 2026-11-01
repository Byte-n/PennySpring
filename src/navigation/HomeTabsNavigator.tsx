import React from 'react';
import { Icon, Row, Text } from '@pennyspring/ui';
import type { IconComponent } from '@pennyspring/ui';
import { ChartBarIcon, ListBulletsIcon } from 'phosphor-react-native';

import { ChartTabScreen } from '../screens/home/tabs/ChartTabScreen';
import { DetailTabScreen } from '../screens/home/tabs/DetailTabScreen';
import { HOME_TAB_ROUTES } from './routes';
import {
  type TabLabelRenderProps,
  type TabScreen,
  TopTabNavigator,
} from '../component/TopTabNavigator';
import { ThemeSwitchButton } from '../screens/home/ThemeSwitchButton.tsx';
import { HomeHeaderLeft } from '../screens/home/HomeHeaderLeft.tsx';

interface HomeTabsNavigatorProps {
  openDrawer: VoidFunction;
}

function renderTabLabel(icon: IconComponent, label: string) {
  return function TabLabel({ focused }: TabLabelRenderProps) {
    const color = focused ? 'primary' : 'tertiary';

    return (
      <Row align="center" gap="small">
        <Icon color={color} icon={icon} size="large" weight="bold" />
        <Text
          color={color}
          size="sm"
          weight={focused ? 'strong' : 'regular'}
        >
          {label}
        </Text>
      </Row>
    );
  };
}

const HOME_TAB_SCREENS: readonly TabScreen[] = [
  {
    name: HOME_TAB_ROUTES.DetailTab,
    label: renderTabLabel(ListBulletsIcon, '明细'),
    labelText: '明细',
    component: DetailTabScreen,
  },
  {
    name: HOME_TAB_ROUTES.ChartTab,
    label: renderTabLabel(ChartBarIcon, '图表'),
    labelText: '图表',
    component: ChartTabScreen,
  },
];

export function HomeTabsNavigator({ openDrawer }: HomeTabsNavigatorProps) {
  return (
    <TopTabNavigator
      leftActions={<HomeHeaderLeft onMenuPress={openDrawer} />}
      rightActions={<ThemeSwitchButton />}
      screens={HOME_TAB_SCREENS}
    />
  );
}
