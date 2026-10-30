import React from 'react';
import { View } from 'react-native';
import { Space, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
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

export function SpaceDirectionDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        <Space style={styles.spaceFrame}>
          <DemoCell>
            <Text size="sm">Horizontal</Text>
          </DemoCell>
          <DemoCell>
            <Text size="sm">Gap</Text>
          </DemoCell>
          <DemoCell>
            <Text size="sm">Row</Text>
          </DemoCell>
        </Space>
        <Space direction="vertical" style={styles.verticalFrame}>
          <DemoCell>
            <Text size="sm">Vertical</Text>
          </DemoCell>
          <DemoCell>
            <Text size="sm">Gap</Text>
          </DemoCell>
        </Space>
      </View>
    </>
  );
}

export default SpaceDirectionDemo;
