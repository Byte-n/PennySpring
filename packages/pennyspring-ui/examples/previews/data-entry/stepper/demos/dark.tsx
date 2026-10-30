import React from 'react';
import { Column, Row, Stepper, Text } from '@pennyspring/ui';
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
    <Column gap="normal" style={styles.surface}>
      <Row gap="large">
        <Stepper defaultValue={6} max={99} min={0} />
        <Stepper defaultValue={6} disabled max={99} min={0} />
        <Stepper defaultValue={6} max={99} min={0} readonly />
      </Row>
    </Column>
  );
}

export function StepperDarkDemo() {
  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        固定深色，不随页面主题：胶囊 8% 白，按钮按压 12% 白，禁用 3.5% 白
      </Text>
      <ThemeProvider config={{ algorithm: 'dark' }}>
        <DarkSurface />
      </ThemeProvider>
    </Column>
  );
}

export default StepperDarkDemo;
