import React from 'react';
import { View } from 'react-native';
import { Space, Stepper } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
  status: {
    paddingVertical: token.paddingXXS,
  },
}));

export const stepperRangeAndStateDemoTitle = 'Range and state';

export function StepperRangeAndStateDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        <Space align="center" size="large" wrap>
          <Stepper defaultValue={0} min={0} max={10} />
          <Stepper defaultValue={10} min={0} max={10} />
          <Stepper defaultValue={4} min={0} max={10} step={2} />
        </Space>
        <Space align="center" size="large" wrap>
          <Stepper defaultValue={1} min={0} max={3} disabled />
          <Stepper defaultValue={1} min={0} max={3} readonly />
        </Space>
      </View>
    </>
  );
}

export default StepperRangeAndStateDemo;
