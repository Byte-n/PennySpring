import React from 'react';
import { Space, Divider, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';

const useStyles = createUseSheetStyle(token => ({
  horizontalStack: {
    gap: token.marginSM,
  },
  verticalRow: {
    alignItems: 'center',
    gap: token.marginSM,
    height: token.controlHeight,
  },
}));

export function DividerVerticalDemo() {
  const styles = useStyles();

  return (
    <>
      <Space align="center" gap="large" wrap style={styles.verticalRow}>
        <Text color="secondary">A</Text>
        <Divider direction="vertical" size="small" />
        <Text color="secondary">B</Text>
        <Divider direction="vertical" />
        <Text color="secondary">C</Text>
        <Divider direction="vertical" size="large" />
        <Text color="secondary">D</Text>
      </Space>
    </>
  );
}

export default DividerVerticalDemo;
