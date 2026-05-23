import React from 'react';
import { View } from 'react-native';
import { Space, Stepper, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
  status: {
    paddingVertical: token.paddingXXS,
  },
}));

export const stepperControlledDemoTitle = 'Controlled';

export function StepperControlledDemo() {
  const styles = useStyles();
  const [value, setValue] = React.useState(2);

  return (
    <>
      <View style={styles.stack}>
        <Space align="center" size="large" wrap>
          <Stepper value={value} min={0} max={10} onChange={setValue} />
          <Stepper
            size="small"
            value={value}
            min={0}
            max={10}
            onChange={setValue}
          />
          <Stepper
            size="large"
            value={value}
            min={0}
            max={10}
            onChange={setValue}
          />
        </Space>
        <View style={styles.status}>
          <Text color="description" size="sm">
            Current value: {String(value)}
          </Text>
        </View>
      </View>
    </>
  );
}

export default StepperControlledDemo;
