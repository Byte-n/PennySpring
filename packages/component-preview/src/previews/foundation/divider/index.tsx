import React from 'react';
import { View } from 'react-native';
import { Divider, Text } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewRow, PreviewScaffold, PreviewSection } from '../../PreviewScaffold';

const useStyles = createUseSheetStyle(token => ({
  horizontalStack: {
    gap: token.marginSM,
  },
  verticalRow: {
    alignItems: 'center',
    gap: token.marginSM,
    height: token.controlHeight,
  },
}));

export function DividerPreview() {
  const styles = useStyles();

  return (
    <PreviewScaffold>
      <PreviewSection title="Horizontal">
        <View style={styles.horizontalStack}>
          <Divider />
          <Divider>Default</Divider>
          <Divider contentPosition="left">Left</Divider>
          <Divider contentPosition="right">Right</Divider>
        </View>
      </PreviewSection>

      <PreviewSection title="Size">
        <View style={styles.horizontalStack}>
          <Divider size="small">Small</Divider>
          <Divider size="normal">Normal</Divider>
          <Divider size="large">Large</Divider>
        </View>
      </PreviewSection>

      <PreviewSection title="Vertical">
        <PreviewRow style={styles.verticalRow}>
          <Text color="secondary">A</Text>
          <Divider direction="vertical" size="small" />
          <Text color="secondary">B</Text>
          <Divider direction="vertical" />
          <Text color="secondary">C</Text>
          <Divider direction="vertical" size="large" />
          <Text color="secondary">D</Text>
        </PreviewRow>
      </PreviewSection>
    </PreviewScaffold>
  );
}
