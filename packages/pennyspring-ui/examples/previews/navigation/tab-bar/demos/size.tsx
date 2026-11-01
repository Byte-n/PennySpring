import React from 'react';
import { Column, Icon, TabBar, Text } from '@pennyspring/ui';
import type { ComponentSize, TabBarItem } from '@pennyspring/ui';

const SIZE_SAMPLES: { size: ComponentSize; hint: string; iconSize: number }[] =
  [
    { size: 'small', hint: 'small · 48 高 / 图标 20 / 文字 12', iconSize: 20 },
    {
      size: 'normal',
      hint: 'normal · 56 高 / 图标 24 / 文字 12',
      iconSize: 24,
    },
    { size: 'large', hint: 'large · 64 高 / 图标 26 / 文字 12', iconSize: 26 },
  ];

function createItems(iconSize: number): TabBarItem[] {
  return [
    {
      activeIcon: (
        <Icon color="primary" icon="home" size={iconSize} weight="fill" />
      ),
      icon: <Icon color="tertiary" icon="home" size={iconSize} />,
      value: 'home',
      titleText: '首页',
    },
    {
      activeIcon: (
        <Icon color="primary" icon="list" size={iconSize} weight="fill" />
      ),
      icon: <Icon color="tertiary" icon="list" size={iconSize} />,
      value: 'chart',
      titleText: '图表',
    },
    {
      activeIcon: (
        <Icon color="primary" icon="user" size={iconSize} weight="fill" />
      ),
      icon: <Icon color="tertiary" icon="user" size={iconSize} />,
      value: 'me',
      titleText: '我的',
    },
  ];
}

export function TabBarSizeDemo() {
  return (
    <Column gap="normal">
      {SIZE_SAMPLES.map(({ size, hint, iconSize }) => (
        <Column key={size} gap="small">
          <Text color="tertiary" size="sm">
            {hint}
          </Text>
          <TabBar
            defaultValue="home"
            items={createItems(iconSize)}
            safeAreaInsetBottom={false}
            size={size}
          />
        </Column>
      ))}
      <Text color="tertiary" size="sm">
        选中只改颜色不铺色块；图标与文字间距 4，文字统一 12
      </Text>
    </Column>
  );
}

export default TabBarSizeDemo;
