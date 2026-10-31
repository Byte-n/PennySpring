import React from 'react';
import { View } from 'react-native';
import { Ellipsis } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';

const LONG_TEXT =
  'PennySpring helps teams review spending details quickly, compare trends, and keep financial records consistent across daily workflows.';

const useStyles = createUseSheetStyle(token => ({
  box: {
    gap: token.marginSM,
    borderWidth: token.lineWidth,
    borderColor: token.colorSplit,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorBgContainer,
    padding: token.padding,
  },
}));

export function EllipsisRowsAndSizeDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.box}>
        <Ellipsis content={LONG_TEXT} rows={2} size="small" />
        <Ellipsis content={LONG_TEXT} rows={2} size="normal" />
        <Ellipsis content={LONG_TEXT} rows={2} size="large" />
      </View>
    </>
  );
}

export default EllipsisRowsAndSizeDemo;
