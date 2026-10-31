import React from 'react';
import { View } from 'react-native';
import { Space, Tag } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';
import type { ReactNode } from 'react';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
  cell: {
    minHeight: token.controlHeightSM,
    minWidth: token.controlHeightLG,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: token.paddingSM,
    paddingVertical: token.paddingXXS,
    borderWidth: token.lineWidth,
    borderColor: token.colorBorder,
    borderRadius: token.borderRadiusSM,
    backgroundColor: token.colorBgContainer,
  },
  spaceFrame: {
    backgroundColor: token.colorFillTertiary,
  },
  verticalFrame: {
    alignSelf: 'flex-start',
    backgroundColor: token.colorFillTertiary,
  },
  wrapFrame: {
    maxWidth: token.controlHeightLG * 5,
    backgroundColor: token.colorFillTertiary,
  },
}));

function DemoCell({ children }: { children: ReactNode }) {
  const styles = useStyles();

  return <View style={styles.cell}>{children}</View>;
}

export function SpaceWrapDemo() {
  const styles = useStyles();

  return (
    <>
      <Space wrap style={styles.wrapFrame}>
        <DemoCell>
          <Tag color="primary">Food</Tag>
        </DemoCell>
        <DemoCell>
          <Tag color="success">Income</Tag>
        </DemoCell>
        <DemoCell>
          <Tag color="warning">Budget</Tag>
        </DemoCell>
        <DemoCell>
          <Tag color="info">Plan</Tag>
        </DemoCell>
        <DemoCell>
          <Tag color="purple">Travel</Tag>
        </DemoCell>
      </Space>
    </>
  );
}

export default SpaceWrapDemo;
