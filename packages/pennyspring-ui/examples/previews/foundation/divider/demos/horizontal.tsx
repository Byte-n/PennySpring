import React from 'react';
import { View } from 'react-native';
import { Divider } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

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

export function DividerHorizontalDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.horizontalStack}>
        <Divider />
        <Divider>Default</Divider>
        <Divider contentPosition="left">Left</Divider>
        <Divider contentPosition="right">Right</Divider>
      </View>
    </>
  );
}

export default DividerHorizontalDemo;
