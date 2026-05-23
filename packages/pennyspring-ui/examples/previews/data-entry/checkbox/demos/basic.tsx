import React from 'react';
import { View } from 'react-native';
import { Checkbox } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export const checkboxBasicDemoTitle = 'Basic';

export function CheckboxBasicDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        <Checkbox defaultValue>Checked</Checkbox>
        <Checkbox>Unchecked</Checkbox>
        <Checkbox indeterminate>Indeterminate</Checkbox>
      </View>
    </>
  );
}

export default CheckboxBasicDemo;
