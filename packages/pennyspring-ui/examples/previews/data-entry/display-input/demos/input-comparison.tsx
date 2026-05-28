import React from 'react';
import { Column, DisplayInput, Input } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export const displayInputInputComparisonDemoTitle = 'Input Comparison';

export function DisplayInputInputComparisonDemo() {
  const styles = useStyles();

  return (
    <>
      <Column style={styles.stack}>
        <Input
          labelText="账户名称"
          placeholder="请输入账户名称"
        />
        <DisplayInput
          labelText="账户名称"
          placeholder="请选择账户"
        />
        <Input
          defaultValue="现金账户"
          labelText="账户名称"
          placeholder="请输入账户名称"
        />
        <DisplayInput
          labelText="账户名称"
          placeholder="请选择账户"
          valueText="现金账户"
        />
        <Input
          errorText="请输入账户名称"
          labelText="账户名称"
          placeholder="请输入账户名称"
        />
        <DisplayInput
          errorText="请选择账户"
          labelText="账户名称"
          placeholder="请选择账户"
        />
      </Column>
    </>
  );
}

export default DisplayInputInputComparisonDemo;
