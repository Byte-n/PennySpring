import React from 'react';
import { View } from 'react-native';
import { Input } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export function InputStateDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        <Input disabled labelText="Disabled" defaultValue="Disabled value" />
        <Input readonly labelText="Readonly" defaultValue="Readonly value" />
        <Input loading labelText="Loading" defaultValue="Checking" />
      </View>
    </>
  );
}

export default InputStateDemo;
