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

export const dividerSizeDemoTitle = 'Size';

export function DividerSizeDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.horizontalStack}>
        <Divider size="small">Small</Divider>
        <Divider size="normal">Normal</Divider>
        <Divider size="large">Large</Divider>
      </View>
    </>
  );
}

export default DividerSizeDemo;
