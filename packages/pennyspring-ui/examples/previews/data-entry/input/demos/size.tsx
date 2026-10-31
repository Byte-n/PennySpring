import React from 'react';
import { Column, Input } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export function InputSizeDemo() {
  const styles = useStyles();

  return (
    <Column style={styles.stack}>
      <Input defaultValue="小尺寸输入值" labelText="Small" size="small" />
      <Input labelText="Small" placeholder="请输入" size="small" />
      <Input
        defaultValue="默认尺寸输入值"
        labelText="Normal (default)"
        size="normal"
      />
      <Input labelText="Normal (default)" placeholder="请输入" size="normal" />
      <Input defaultValue="大尺寸输入值" labelText="Large" size="large" />
      <Input labelText="Large" placeholder="请输入" size="large" />
    </Column>
  );
}

export default InputSizeDemo;