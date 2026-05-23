import React from 'react';
import { View } from 'react-native';
import { Skeleton } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  card: {
    gap: token.marginSM,
    borderWidth: token.lineWidth,
    borderColor: token.colorSplit,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorBgContainer,
    padding: token.padding,
  },
  stack: {
    gap: token.marginXS,
  },
  block: {
    width: '100%',
  },
  w40: {
    width: '40%',
  },
  w30: {
    width: '30%',
  },
  w50: {
    width: '50%',
  },
  w85: {
    width: '85%',
  },
  w46: {
    width: '46%',
  },
}));

export const skeletonLayoutDemoTitle = 'Layout';

export function SkeletonLayoutDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.card}>
        <View style={styles.stack}>
          <Skeleton shape="line" style={styles.w50} />
          <Skeleton shape="line" style={styles.block} />
          <Skeleton shape="line" style={styles.w85} />
          <Skeleton shape="rect" size="large" style={styles.block} />
        </View>
      </View>
    </>
  );
}

export default SkeletonLayoutDemo;
