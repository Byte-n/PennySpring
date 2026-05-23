import React from 'react';
import { View } from 'react-native';
import { Radio } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export const radioBasicDemoTitle = 'Basic';

export function RadioBasicDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        <Radio defaultValue>Selected</Radio>
        <Radio>Unselected</Radio>
        <Radio readonly defaultValue>
          Readonly
        </Radio>
        <Radio disabled defaultValue>
          Disabled
        </Radio>
      </View>
    </>
  );
}

export default RadioBasicDemo;
