import React from 'react';
import { View } from 'react-native';
import { Input } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export function InputStatusDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        <Input
          labelText="账户名称"
          placeholder="请输入账户名称"
        />
        <Input
          defaultValue="现金账户"
          labelText="账户名称"
          placeholder="请输入账户名称"
        />
        <Input
          labelText="金额"
          placeholder="0.00"
          status="error"
        />
      </View>
    </>
  );
}

export default InputStatusDemo;
