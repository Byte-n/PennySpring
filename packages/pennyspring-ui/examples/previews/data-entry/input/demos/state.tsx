import React from 'react';
import { View } from 'react-native';
import { Input } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export const inputStateDemoTitle = 'State';

export function InputStateDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        <Input disabled label="Disabled" defaultValue="Disabled value" />
        <Input readonly label="Readonly" defaultValue="Readonly value" />
        <Input loading label="Loading" defaultValue="Checking" />
      </View>
    </>
  );
}

export default InputStateDemo;
