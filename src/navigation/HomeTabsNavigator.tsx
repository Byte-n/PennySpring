import React from 'react';
import { Badge, Icon, Row, Text } from '@pennyspring/ui';
import type { IconComponent } from '@pennyspring/ui';
import { useNavigationState } from '@react-navigation/native';
import {
  ChartBarIcon,
  ListBulletsIcon,
  NotePencilIcon,
} from 'phosphor-react-native';

import { ChartTabScreen } from '../screens/home/tabs/ChartTabScreen';
import { DetailTabScreen } from '../screens/home/tabs/DetailTabScreen';
import { DraftTabScreen } from '../screens/home/tabs/DraftTabScreen';
import { HOME_TAB_ROUTES } from './routes';
import {
  type TabLabelRenderProps,
  type TabScreen,
  TopTabNavigator,
} from '../component/TopTabNavigator';
import { useDraftOpenCount } from '../features/quickBookDraft/useDraftOpenCount';
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
        <Text color={color} size="sm" weight={focused ? 'strong' : 'regular'}>
          {label}
        </Text>
      </Row>
    );
  };
}

function DraftTabLabelContent({ focused }: TabLabelRenderProps) {
  const isDraftTabFocused = useNavigationState(
    state => state.routes[state.index ?? 0]?.name === HOME_TAB_ROUTES.DraftTab,
  );
  const openCount = useDraftOpenCount(isDraftTabFocused);
  const color = focused ? 'primary' : 'tertiary';

  return (
    <Row align="center" gap="small">
      <Icon color={color} icon={NotePencilIcon} size="large" weight="bold" />
      <Text color={color} size="sm" weight={focused ? 'strong' : 'regular'}>
        草稿
      </Text>
      {openCount > 0 ? (
        <Badge color="danger" count={openCount} size="small" />
      ) : null}
    </Row>
  );
}

function DraftTabLabel({ focused }: TabLabelRenderProps) {
  return <DraftTabLabelContent focused={focused} />;
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
  {
    name: HOME_TAB_ROUTES.DraftTab,
    label: DraftTabLabel,
    labelText: '草稿',
    component: DraftTabScreen,
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
