import React from 'react';
import { Column, Text, Textarea } from '@pennyspring/ui';

export function TextareaStatusDemo() {
  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        有 label 时未聚焦 placeholder 透明，label 占首行；聚焦或有值后 label 浮到左上。聚焦与状态用 2px 指示条自左展开
      </Text>
      <Textarea
        labelText="备注"
        placeholder="例如：工作日午餐"
      />
      <Textarea
        defaultValue="工作日午餐"
        labelText="备注"
        maxLength={200}
        showCount
      />
      <Textarea
        defaultValue="2026-1026-0031-XL"
        labelText="小票号"
        minRows={1}
        status="error"
      />
      <Textarea
        defaultValue="含 3 个无法识别的符号，已保留原文。"
        labelText="备注"
        maxLength={200}
        showCount
        status="warning"
      />
      <Textarea
        defaultValue="2026-1026-0031-XL"
        labelText="小票号"
        minRows={1}
        status="success"
      />
      <Textarea
        defaultValue="微信账单 2026-10.csv"
        labelText="来源"
        minRows={1}
        readonly
      />
      <Textarea
        defaultValue="工作日午餐"
        labelText="关联模板"
        minRows={1}
        disabled
      />
    </Column>
  );
}

export default TextareaStatusDemo;
