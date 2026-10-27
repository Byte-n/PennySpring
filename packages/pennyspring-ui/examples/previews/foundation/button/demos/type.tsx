import React from 'react';
import { Button, Space, Text } from '@pennyspring/ui';

export const buttonTypeDemoTitle = '类型（type）';

export function ButtonTypeDemo() {
  return (
    <Space direction="vertical" size="normal" align="start">
      <Text color="tertiary" size="sm">
        primary 实底主操作；default 浅底填充（colorFillTertiary），不再常驻描边
      </Text>
      <Space align="center" size="large" wrap>
        <Button type="primary">保存记录</Button>
        <Button>存为模板</Button>
        <Button type="dashed">＋ 添加分类</Button>
        <Button type="text">跳过</Button>
        <Button type="link">查看全部</Button>
        <Button type="danger">删除记录</Button>
      </Space>
    </Space>
  );
}

export default ButtonTypeDemo;
