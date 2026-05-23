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
          label="Normal"
          placeholder="Placeholder"
          defaultValue="PennySpring"
        />
        <Input required label="Required" placeholder="Required field" />
        <Input
          clearable
          defaultValue="Search text"
          label="With addons"
          prefix={
            <Icon icon="search" color="colorIcon" size="large" />
          }
          suffix={<Text color="description">USD</Text>}
        />
      </View>
    </>
  );
}

export default InputBasicDemo;
