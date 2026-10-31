import React, { type ReactNode } from 'react';
import { View } from 'react-native';
import { Row, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';

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

export function LayoutRowDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        <Row gap={8} style={styles.frame}>
          <DemoCell>
            <Text size="sm">A</Text>
          </DemoCell>
          <DemoCell>
            <Text size="sm">B</Text>
          </DemoCell>
          <DemoCell>
            <Text size="sm">C</Text>
          </DemoCell>
        </Row>
        <Row justify="between" style={styles.frame}>
          <DemoCell>
            <Text size="sm">Start</Text>
          </DemoCell>
          <DemoCell>
            <Text size="sm">End</Text>
          </DemoCell>
        </Row>
        <Row justify="center" gap={8} wrap style={styles.frame}>
          <DemoCell>
            <Text size="sm">Wrap</Text>
          </DemoCell>
          <DemoCell>
            <Text size="sm">Items</Text>
          </DemoCell>
          <DemoCell>
            <Text size="sm">Here</Text>
          </DemoCell>
        </Row>
      </View>
    </>
  );
}

export default LayoutRowDemo;
