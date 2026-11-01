import React from 'react';
import { Button, Column, Result, Text } from '@pennyspring/ui';
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
    <Column style={styles.surface}>
      <Result
        status="success"
        subtitleText="¥ 128.00 · 餐饮 · 日常开销"
        titleText="记账成功"
        extra={
          <Button size="small" variant="solid">
            完成
          </Button>
        }
      />
    </Column>
  );
}

export function ResultDarkDemo() {
  return (
    <Column gap="normal">
      <Text color="tertiary" size="xs">
        深色下语义底降到 12% 透明，图标自动提亮一档
      </Text>
      <ThemeProvider config={{ algorithm: 'dark' }}>
        <DarkSurface />
      </ThemeProvider>
    </Column>
  );
}

export default ResultDarkDemo;
