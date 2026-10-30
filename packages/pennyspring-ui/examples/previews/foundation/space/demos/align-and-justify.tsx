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

export function SpaceAlignAndJustifyDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        <Space align="center" justify="between" block style={styles.spaceFrame}>
          <DemoCell>
            <Text size="sm">Start</Text>
          </DemoCell>
          <DemoCell>
            <Text color="description" size="sm">
              Center aligned
            </Text>
          </DemoCell>
          <DemoCell>
            <Text size="sm">End</Text>
          </DemoCell>
        </Space>
        <Space align="baseline" style={styles.spaceFrame}>
          <DemoCell>
            <Text size="h4" weight="strong">
              42
            </Text>
          </DemoCell>
          <DemoCell>
            <Text color="secondary">baseline text</Text>
          </DemoCell>
        </Space>
      </View>
    </>
  );
}

export default SpaceAlignAndJustifyDemo;
