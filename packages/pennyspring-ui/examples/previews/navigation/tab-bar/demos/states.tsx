import React from 'react';
import { View } from 'react-native';
import { Column, Icon, TabBar, Text } from '@pennyspring/ui';

function icon(name: 'home' | 'list' | 'user', active = false) {
  return (
    <Icon
      color={active ? 'primary' : 'tertiary'}
      icon={name}
      size={24}
      weight={active ? 'fill' : 'regular'}
    />
  );
}

export function TabBarStatesDemo() {
  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        未选图标与文字三级；选中主色图标 + 主色 600 文字；按压为 12 圆角 colorFillTertiary，内缩 4
      </Text>
      <TabBar
        defaultValue="home"
        items={[
          { activeIcon: icon('home', true), icon: icon('home'), key: 'home', titleText: '首页' },
          { activeIcon: icon('list', true), icon: icon('list'), key: 'chart', titleText: '图表' },
        ]}
        safeAreaInsetBottom={false}
      />
      <Text color="tertiary" size="sm">
        禁用：图标与文字四级，不加透明度，不响应点击
      </Text>
      <TabBar
        defaultValue="home"
        items={[
          { activeIcon: icon('home', true), icon: icon('home'), key: 'home', titleText: '首页' },
          { disabled: true, icon: icon('user'), key: 'me', titleText: '我的' },
        ]}
        safeAreaInsetBottom={false}
      />
      <Text color="tertiary" size="sm">
        角标：数字 18 高、最小 18、超过 99 显示 99+；红点传 badge 节点
      </Text>
      <TabBar
        defaultValue="chart"
        items={[
          { icon: icon('home'), key: 'home', titleText: '首页' },
          {
            activeIcon: icon('list', true),
            badgeText: '12',
            icon: icon('list'),
            key: 'chart',
            titleText: '图表',
          },
          {
            badge: <View />,
            icon: icon('user'),
            key: 'me',
            titleText: '我的',
          },
        ]}
        safeAreaInsetBottom={false}
      />
      <Text color="tertiary" size="sm">
        安全区：safeAreaInsetBottom 时底部内边距 8，否则 4
      </Text>
    </Column>
  );
}

export default TabBarStatesDemo;
