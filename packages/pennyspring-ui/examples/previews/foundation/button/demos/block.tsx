import React from 'react';
import { Button, Column, Text } from '@pennyspring/ui';

export function ButtonBlockDemo() {
  return (
    <Column gap="small">
      <Text color="secondary" size="sm">
        block 只用于表单底部与浮层动作区；一屏最多一条全宽主按钮
      </Text>
      <Button block type="primary">
        保存记录
      </Button>
      <Button block>另存为模板</Button>
    </Column>
  );
}

export default ButtonBlockDemo;
