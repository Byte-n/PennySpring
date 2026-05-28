import React, { type ReactNode } from 'react';
import { View } from 'react-native';
import { Row, Spacer, Text } from '@pennyspring/ui';
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

export const layoutSpacerDemoTitle = 'Spacer';

export function LayoutSpacerDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        <Row style={styles.frame}>
          <DemoCell>
            <Text size="sm">Left</Text>
          </DemoCell>
          <Spacer />
          <DemoCell>
            <Text size="sm">Right</Text>
          </DemoCell>
        </Row>
        <Row style={styles.frame}>
          <DemoCell>
            <Text size="sm">A</Text>
          </DemoCell>
          <Spacer size="large" />
          <DemoCell>
            <Text size="sm">B</Text>
          </DemoCell>
          <Spacer flex={2} />
          <DemoCell>
            <Text size="sm">C</Text>
          </DemoCell>
        </Row>
      </View>
    </>
  );
}

export default LayoutSpacerDemo;
