import React from 'react';
import { View } from 'react-native';
import { Stepper, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewRow, PreviewScaffold, PreviewSection } from '../../PreviewScaffold';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
  status: {
    paddingVertical: token.paddingXXS,
  },
}));

export function StepperPreview() {
  const styles = useStyles();
  const [value, setValue] = React.useState(2);

  return (
    <PreviewScaffold>
      <PreviewSection title="Controlled">
        <View style={styles.stack}>
          <PreviewRow>
            <Stepper value={value} min={0} max={10} onChange={setValue} />
            <Stepper size="small" value={value} min={0} max={10} onChange={setValue} />
            <Stepper size="large" value={value} min={0} max={10} onChange={setValue} />
          </PreviewRow>
          <View style={styles.status}>
            <Text color="description" size="sm">
              Current value: {String(value)}
            </Text>
          </View>
        </View>
      </PreviewSection>

      <PreviewSection title="Range and state">
        <View style={styles.stack}>
          <PreviewRow>
            <Stepper defaultValue={0} min={0} max={10} />
            <Stepper defaultValue={10} min={0} max={10} />
            <Stepper defaultValue={4} min={0} max={10} step={2} />
          </PreviewRow>
          <PreviewRow>
            <Stepper defaultValue={1} min={0} max={3} disabled />
            <Stepper defaultValue={1} min={0} max={3} readonly />
          </PreviewRow>
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
