import React from 'react';
import { Column, Icon, TabBar, Text } from '@pennyspring/ui';
import { createUseSheetStyle, ThemeProvider } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  surface: {
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    overflow: 'hidden',
  },
}));

function DarkSurface() {
  const styles = useStyles();

  return (
    <Column style={styles.surface}>
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
            badgeText: '3',
            icon: <Icon color="tertiary" icon="list" size={24} />,
            key: 'chart',
            titleText: '图表',
          },
          {
            disabled: true,
            icon: <Icon color="tertiary" icon="user" size={24} />,
            key: 'me',
            titleText: '我的',
          },
        ]}
      />
    </Column>
  );
}

export function TabBarDarkDemo() {
  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        固定深色，不随页面主题：背景取 colorBgContainer，顶部线 colorSplit，未选图标 .45 白
      </Text>
      <ThemeProvider config={{ algorithm: 'dark' }}>
        <DarkSurface />
      </ThemeProvider>
    </Column>
  );
}

export default TabBarDarkDemo;
