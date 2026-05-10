import React from 'react';
import { View } from 'react-native';
import { Slider, Text } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export function SliderPreview() {
  const styles = useStyles();
  const [value, setValue] = React.useState(42);

  return (
    <PreviewScaffold>
      <PreviewSection title="Basic and size">
        <View style={styles.stack}>
          <Slider value={value} onChange={setValue} />
          <Text color="description" size="sm">
            Value: {value}
          </Text>
          <Slider defaultValue={20} size="small" />
          <Slider defaultValue={70} size="large" />
        </View>
      </PreviewSection>

      <PreviewSection title="Range and state">
        <View style={styles.stack}>
          <Slider defaultValue={30} min={0} max={1} step={0.1} />
          <Slider disabled defaultValue={60} />
          <Slider readonly defaultValue={45} />
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
