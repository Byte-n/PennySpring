import React from 'react';
import { Column, Tabs, Text } from '@pennyspring/ui';
import { createUseSheetStyle, ThemeProvider } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  surface: {
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    padding: token.paddingSM,
  },
}));

export const tabsDarkDemoTitle = '深色对照';

function DarkSurface() {
  const styles = useStyles();

  return (
    <Column gap="small" style={styles.surface}>
      <Tabs
        defaultValue="overview"
        items={[
          { label: '概览', value: 'overview' },
          { label: '明细', value: 'records' },
          { label: '图表', value: 'trend' },
          { disabled: true, label: '预算', value: 'budget' },
        ]}
      />
      <Text color="tertiary" size="sm">
        深色未选文字 .45 白，选中用亮一档品牌色，列表线 .09 白
      </Text>
    </Column>
  );
}

export function TabsDarkDemo() {
  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">固定深色，不随页面主题</Text>
      <ThemeProvider config={{ algorithm: 'dark' }}>
        <DarkSurface />
      </ThemeProvider>
    </Column>
  );
}

export default TabsDarkDemo;
