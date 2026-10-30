import React from 'react';
import { View } from 'react-native';
import { Icon, Input, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export const inputBasicDemoTitle = 'Basic';

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
          clearable
          defaultValue="Search text"
          labelText="With addons"
          prefix={
            <Icon icon="search" color="icon" size="large" />
          }
          suffix={<Text color="description">USD</Text>}
        />
      </View>
    </>
  );
}

export default InputBasicDemo;
