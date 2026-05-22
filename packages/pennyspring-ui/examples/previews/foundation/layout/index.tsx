import React, { type ReactNode } from 'react';
import { View } from 'react-native';
import {
  Column,
  GeometryReader,
  Row,
  Spacer,
  Text,
} from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';

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

export function LayoutPreview() {
  const styles = useStyles();

  return (
    <PreviewScaffold>
      <PreviewSection title="Row">
        <View style={styles.stack}>
          <Row gap={8} style={styles.frame}>
            <DemoCell><Text size="sm">A</Text></DemoCell>
            <DemoCell><Text size="sm">B</Text></DemoCell>
            <DemoCell><Text size="sm">C</Text></DemoCell>
          </Row>
          <Row justify="between" style={styles.frame}>
            <DemoCell><Text size="sm">Start</Text></DemoCell>
            <DemoCell><Text size="sm">End</Text></DemoCell>
          </Row>
          <Row justify="center" gap={8} wrap style={styles.frame}>
            <DemoCell><Text size="sm">Wrap</Text></DemoCell>
            <DemoCell><Text size="sm">Items</Text></DemoCell>
            <DemoCell><Text size="sm">Here</Text></DemoCell>
          </Row>
        </View>
      </PreviewSection>

      <PreviewSection title="Column">
        <View style={styles.stack}>
          <Column gap={8} align="center" style={styles.frame}>
            <DemoCell><Text size="sm">Top</Text></DemoCell>
            <DemoCell><Text size="sm">Middle</Text></DemoCell>
            <DemoCell><Text size="sm">Bottom</Text></DemoCell>
          </Column>
        </View>
      </PreviewSection>

      <PreviewSection title="Spacer">
        <View style={styles.stack}>
          <Row style={styles.frame}>
            <DemoCell><Text size="sm">Left</Text></DemoCell>
            <Spacer />
            <DemoCell><Text size="sm">Right</Text></DemoCell>
          </Row>
          <Row style={styles.frame}>
            <DemoCell><Text size="sm">A</Text></DemoCell>
            <Spacer size={32} />
            <DemoCell><Text size="sm">B</Text></DemoCell>
            <Spacer min={8} max={64} />
            <DemoCell><Text size="sm">C</Text></DemoCell>
          </Row>
        </View>
      </PreviewSection>

      <PreviewSection title="GeometryReader">
        <GeometryReader style={styles.geometryBox}>
          {({ width, height }) => (
            <Column align="center" justify="center" style={styles.geometryContent}>
              <Text size="sm" color="secondary">
                {Math.round(width)} x {Math.round(height)}
              </Text>
            </Column>
          )}
        </GeometryReader>
      </PreviewSection>
    </PreviewScaffold>
  );
}
