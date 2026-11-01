import React from 'react';
import { View } from 'react-native';
import { Icon, Input, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export function InputBasicDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        <Input
          labelText="Normal"
          placeholder="Placeholder"
          defaultValue="PennySpring"
        />
        <Input disabled labelText="Disabled" placeholder="Disabled field" />
        <Input
          allowClear
          defaultValue="Search text"
          labelText="With addons"
          prefix={<Icon icon="search" color="icon" size="large" />}
          suffix={<Text color="description">USD</Text>}
        />
      </View>
    </>
  );
}

export default InputBasicDemo;
