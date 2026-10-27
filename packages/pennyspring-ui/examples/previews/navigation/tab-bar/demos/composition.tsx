import React from 'react';
import { Column, Icon, TabBar, Text } from '@pennyspring/ui';

export const tabBarCompositionDemoTitle = '结构组合';

export function TabBarCompositionDemo() {
  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        图标 + 文字：默认结构，activeIcon 在选中时替换 icon
      </Text>
      <TabBar
        defaultValue="home"
        items={[
          {
            activeIcon: <Icon color="primary" icon="home" size={24} weight="fill" />,
            icon: <Icon color="tertiary" icon="home" size={24} />,
            key: 'home',
            titleText: '首页',
          },
          {
            activeIcon: <Icon color="primary" icon="list" size={24} weight="fill" />,
            icon: <Icon color="tertiary" icon="list" size={24} />,
            key: 'chart',
            titleText: '图表',
          },
        ]}
        safeAreaInsetBottom={false}
      />
      <Text color="tertiary" size="sm">
        仅图标：需要 44 热区；仅文字：用于纯导航页
      </Text>
      <TabBar
        defaultValue="home"
        items={[
          { activeIcon: <Icon color="primary" icon="home" size={24} weight="fill" />, icon: <Icon color="tertiary" icon="home" size={24} />, key: 'home' },
          { icon: <Icon color="tertiary" icon="list" size={24} />, key: 'chart' },
          { icon: <Icon color="tertiary" icon="user" size={24} />, key: 'me' },
        ]}
        safeAreaInsetBottom={false}
      />
      <TabBar
        defaultValue="a"
        items={[
          { key: 'a', titleText: '记录' },
          { key: 'b', titleText: '统计' },
          { key: 'c', titleText: '设置' },
        ]}
        safeAreaInsetBottom={false}
      />
    </Column>
  );
}

export default TabBarCompositionDemo;
