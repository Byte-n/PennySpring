import React from 'react';
import { View } from 'react-native';
import { Slider } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export const sliderRangeAndStateDemoTitle = 'Range and state';

export function SliderRangeAndStateDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        <Slider defaultValue={30} min={20} max={80} />
        <Slider defaultValue={0.4} min={0} max={1} step={0.2} />
        <Slider defaultValue={100} min={0} max={100} step={25} />
        <Slider disabled defaultValue={60} />
        <Slider readonly defaultValue={45} />
      </View>
    </>
  );
}

export default SliderRangeAndStateDemo;
