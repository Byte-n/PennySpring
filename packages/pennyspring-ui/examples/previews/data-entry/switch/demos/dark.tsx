import React from 'react';
import { Column, Row, Switch, Text } from '@pennyspring/ui';
import { createUseSheetStyle, ThemeProvider } from '@pennyspring/ui';

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
      <Row align="center" gap="small">
        <Text size="sm">深色关</Text>
        <Switch />
      </Row>
      <Row align="center" gap="small">
        <Text size="sm">深色开</Text>
        <Switch defaultValue />
      </Row>
      <Row align="center" gap="small">
        <Text size="sm">深色禁用</Text>
        <Switch defaultValue disabled />
      </Row>
      <Row align="center" gap="small">
        <Switch checkedText="已开启" uncheckedText="未开启" />
      </Row>
    </Column>
  );
}

export function SwitchDarkDemo() {
  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        固定深色，不随页面主题：关态轨道取 colorFillTertiary（8% 白），开态取 colorPrimary，滑块恒为白
      </Text>
      <ThemeProvider config={{ algorithm: 'dark' }}>
        <DarkSurface />
      </ThemeProvider>
    </Column>
  );
}

export default SwitchDarkDemo;
