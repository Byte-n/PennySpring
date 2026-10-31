import React from 'react';
import { View } from 'react-native';
import { Space, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import type { ReactNode } from 'react';

const SPACE_SIZES = ['small', 'normal', 'large'] as const;

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

export function SpaceSizeDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        {SPACE_SIZES.map(size => (
          <Space key={size} gap={size} style={styles.spaceFrame}>
            <DemoCell>
              <Text size="sm">{size}</Text>
            </DemoCell>
            <DemoCell>
              <Text size="sm">Gap</Text>
            </DemoCell>
            <DemoCell>
              <Text size="sm">Row</Text>
            </DemoCell>
          </Space>
        ))}
      </View>
    </>
  );
}

export default SpaceSizeDemo;
