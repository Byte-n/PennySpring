import React from 'react';
import { Column, Slider, Text } from '@pennyspring/ui';
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
    <Column gap="normal" style={styles.surface}>
      <Slider defaultValue={62} />
      <Slider defaultValue={30} disabled />
    </Column>
  );
}

export function SliderDarkDemo() {
  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        固定深色，不随页面主题：深色轨道 .12 白，thumb
        白面自然浮起，禁用滑块去投影
      </Text>
      <ThemeProvider config={{ algorithm: 'dark' }}>
        <DarkSurface />
      </ThemeProvider>
    </Column>
  );
}

export default SliderDarkDemo;
