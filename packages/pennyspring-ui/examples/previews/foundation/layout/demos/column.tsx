import React, { type ReactNode } from 'react';
import { View } from 'react-native';
import { Column, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
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
  frame: {
    backgroundColor: token.colorFillTertiary,
    padding: token.paddingXS,
    borderRadius: token.borderRadiusSM,
  },
  stack: {
    gap: token.marginSM,
  },
  geometryBox: {
    height: token.controlHeightLG * 2,
    backgroundColor: token.colorFillTertiary,
    borderRadius: token.borderRadiusSM,
  },
  geometryContent: {
    flex: 1,
  },
}));

function DemoCell({ children }: { children: ReactNode }) {
  const styles = useStyles();
  return <View style={styles.cell}>{children}</View>;
}

export const layoutColumnDemoTitle = 'Column';

export function LayoutColumnDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        <Column gap={8} align="center" style={styles.frame}>
          <DemoCell>
            <Text size="sm">Top</Text>
          </DemoCell>
          <DemoCell>
            <Text size="sm">Middle</Text>
          </DemoCell>
          <DemoCell>
            <Text size="sm">Bottom</Text>
          </DemoCell>
        </Column>
      </View>
    </>
  );
}

export default LayoutColumnDemo;
