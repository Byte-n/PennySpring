import React from 'react';
import { View } from 'react-native';
import { Input } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export const inputStatusDemoTitle = 'Status';

export function InputStatusDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        <Input
          label="Error"
          status="error"
          errorText="Invalid value"
          defaultValue="100.00"
        />
        <Input
          label="Warning"
          status="warning"
          helperText="Please review this value"
          defaultValue="42"
        />
        <Input
          label="Success"
          status="success"
          helperText="Looks good"
          defaultValue="Ready"
        />
      </View>
    </>
  );
}

export default InputStatusDemo;
