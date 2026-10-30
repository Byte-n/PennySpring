import React from 'react';
import { Checkbox, Column, Row, Text } from '@pennyspring/ui';
import { createUseSheetStyle, ThemeProvider } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  surface: {
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    padding: token.paddingSM,
  },
}));

const DARK_CATEGORY_OPTIONS = [
  { label: '餐饮', value: 'food' },
  { label: '交通', value: 'traffic' },
];

function DarkSurface() {
  const styles = useStyles();

  return (
    <Column gap="small" style={styles.surface}>
      <Checkbox>深色未选</Checkbox>
      <Checkbox defaultValue>深色选中</Checkbox>
      <Checkbox indeterminate>深色半选</Checkbox>
      <Checkbox disabled>深色禁用</Checkbox>
      <Row gap="small" wrap>
        <Checkbox.Group defaultValue={['food']} displayType="button" options={DARK_CATEGORY_OPTIONS} />
      </Row>
    </Column>
  );
}

export function CheckboxDarkDemo() {
  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        固定深色，不随页面主题：未选框底取 colorBgContainer、描边取 colorBorder，禁用框底降到 colorFillQuaternary
      </Text>
      <ThemeProvider config={{ algorithm: 'dark' }}>
        <DarkSurface />
      </ThemeProvider>
    </Column>
  );
}

export default CheckboxDarkDemo;
