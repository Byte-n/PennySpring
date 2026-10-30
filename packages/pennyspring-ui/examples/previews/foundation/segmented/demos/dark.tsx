import React from 'react';
import { Column, Segmented, Text } from '@pennyspring/ui';
import { createUseSheetStyle, ThemeProvider } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  surface: {
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    padding: token.paddingSM,
  },
}));

function DarkSurface() {
  const styles = useStyles();

  return (
    <Column gap="small" style={styles.surface}>
      <Segmented
        defaultValue="income"
        options={[
          { label: '支出', value: 'expense' },
          { label: '收入', value: 'income' },
          { label: '转账', value: 'transfer' },
        ]}
      />
      <Segmented
        defaultValue="week"
        options={[
          { label: '日', value: 'day' },
          { label: '周', value: 'week' },
          { label: '月', value: 'month' },
        ]}
        size="small"
      />
    </Column>
  );
}

export function SegmentedDarkDemo() {
  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        固定深色，不随页面主题：轨道 8% 白，选中块取 colorBgContainer 并保留轻投影，文字对比靠白度
      </Text>
      <ThemeProvider config={{ algorithm: 'dark' }}>
        <DarkSurface />
      </ThemeProvider>
    </Column>
  );
}

export default SegmentedDarkDemo;
