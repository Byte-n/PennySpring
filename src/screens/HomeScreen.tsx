import React from 'react';
import {
  TopTabNavigator,
  type TabScreen,
  TextPreview,
} from '../../packages/component';
import { ChartTab } from './tabs/ChartTab';
import { DetailTab } from './tabs/DetailTab';
import { ThemePreview } from '@pennyspring/theme';

const screens: readonly TabScreen[] = [
  {
    name: 'themePreview',
    label: '主题预览',
    component: ThemePreview,
  },
  {
    name: 'TextPreview',
    label: 'TextPreview',
    component: TextPreview,
  },
  {
    name: 'Detail',
    label: '明细',
    component: DetailTab,
  },
  {
    name: 'Chart',
    label: '图表',
    component: ChartTab,
  },
];

export function HomeScreen() {
  return <TopTabNavigator screens={screens} />;
}
