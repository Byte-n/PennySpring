import React from 'react';
import { View } from 'react-native';
import { Input } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export const inputStatusDemoTitle = 'Floating Label';

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
          labelText="备注"
          placeholder="可选"
          helperText="最多 100 字"
        />
        <Input
          labelText="金额"
          placeholder="0.00"
          errorText="请输入有效金额"
        />
      </View>
    </>
  );
}

export default InputStatusDemo;
