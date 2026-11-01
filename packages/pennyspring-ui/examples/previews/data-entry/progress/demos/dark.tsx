import React from 'react';
import { Column, Progress, Row, Text } from '@pennyspring/ui';
import { createUseSheetStyle, ThemeProvider } from '@pennyspring/ui';

const useStyles = createUseSheetStyle(token => ({
  surface: {
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    gap: token.marginSM,
    padding: token.paddingSM,
  },
}));

function DarkSurface() {
  const styles = useStyles();

  return (
    <Column style={styles.surface}>
      <Text color="secondary" size="xs">
        本月餐饮
      </Text>
      <Progress.Bar percent={62} />
      <Row gap="large">
        <Progress.Circle percent={60} />
        <Progress.Circle percent={100} status="success" />
      </Row>
    </Column>
  );
}

export function ProgressDarkDemo() {
  return (
    <Column gap="normal">
      <Text color="tertiary" size="xs">
        深色下轨道 8% 白，仍能看出剩余量；状态色自动提亮
      </Text>
      <ThemeProvider config={{ algorithm: 'dark' }}>
        <DarkSurface />
      </ThemeProvider>
    </Column>
  );
}

export default ProgressDarkDemo;
