import React from 'react';
import { View } from 'react-native';
import { Slider, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export const sliderBasicAndSizeDemoTitle = 'Basic and size';

export function SliderBasicAndSizeDemo() {
  const styles = useStyles();
  const [value, setValue] = React.useState(42);

  return (
    <>
      <View style={styles.stack}>
        <Slider value={value} onChange={setValue} />
        <Text color="description" size="sm">
          Value: {value}
        </Text>
        <Slider defaultValue={20} size="small" />
        <Slider defaultValue={70} size="large" />
      </View>
    </>
  );
}

export default SliderBasicAndSizeDemo;
