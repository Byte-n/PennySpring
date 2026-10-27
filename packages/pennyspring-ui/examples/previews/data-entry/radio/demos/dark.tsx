import React from 'react';
import { Column, Radio, Text } from '@pennyspring/ui';
import { createUseSheetStyle, ThemeProvider } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  surface: {
    backgroundColor: token.colorBgLayout,
    borderRadius: token.borderRadiusLG,
    padding: token.paddingSM,
  },
}));

export const radioDarkDemoTitle = '深色对照';

const DIMENSION_OPTIONS = [
  { label: '按分类', value: 'category' },
  { label: '按标签', value: 'tag' },
];

function DarkSurface() {
  const styles = useStyles();

  return (
    <Column gap="small" style={styles.surface}>
      <Radio>深色未选</Radio>
      <Radio defaultValue>深色选中</Radio>
      <Radio defaultValue disabled>深色禁用</Radio>
      <Radio defaultValue readonly>深色只读</Radio>
      <Radio.Group
        defaultValue="month"
        displayType="button"
        options={[
          { label: '本月', value: 'month' },
          { label: '近 3 月', value: 'quarter' },
        ]}
      />
      <Radio.Group block defaultValue="category" displayType="button" options={DIMENSION_OPTIONS} />
    </Column>
  );
}

export function RadioDarkDemo() {
  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        固定深色，不随页面主题：外圈取 colorBorder（.18 白），圆点取深色档 colorPrimary，禁用外圈降到 colorSplit
      </Text>
      <ThemeProvider config={{ algorithm: 'dark' }}>
        <DarkSurface />
      </ThemeProvider>
    </Column>
  );
}

export default RadioDarkDemo;
