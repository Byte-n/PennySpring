import React from 'react';
import { Space, Skeleton } from '@pennyspring/ui';
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

export const skeletonAnimatedAndStaticDemoTitle = 'Animated and static';

export function SkeletonAnimatedAndStaticDemo() {
  const styles = useStyles();

  return (
    <>
      <Space align="center" size="large" wrap>
        <Skeleton shape="rect" style={styles.w46} size="large" />
        <Skeleton
          shape="rect"
          style={styles.w46}
          size="large"
          animated={false}
        />
      </Space>
    </>
  );
}

export default SkeletonAnimatedAndStaticDemo;
