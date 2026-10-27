import React from 'react';
import { Column, Text, Textarea } from '@pennyspring/ui';

export const textareaStatusDemoTitle = '状态（status）';

export function TextareaStatusDemo() {
  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        字段无底色无圆角，只有 1px 底边；聚焦与状态用 2px 指示条自左展开，错误不铺浅红底
      </Text>
      <Textarea
        helperText="会出现在账单明细里"
        labelText="备注"
        placeholder="例如：工作日午餐"
        required
      />
      <Textarea
        defaultValue="工作日午餐"
        helperText="点击输入框可切换聚焦 / 失焦"
        labelText="备注"
        maxLength={200}
        showCount
      />
      <Textarea
        defaultValue="2026-1026-0031-XL"
        errorText="小票号已被另一笔记录使用"
        labelText="小票号"
        minRows={1}
        status="error"
      />
      <Textarea
        defaultValue="含 3 个无法识别的符号，已保留原文。"
        helperText="建议人工核对后保存"
        labelText="备注"
        maxLength={200}
        showCount
        status="warning"
      />
      <Textarea
        defaultValue="2026-1026-0031-XL"
        helperText="已通过小票校验"
        labelText="小票号"
        minRows={1}
        status="success"
      />
      <Textarea
        defaultValue="微信账单 2026-10.csv"
        helperText="导入记录不可修改来源"
        labelText="来源"
        minRows={1}
        readonly
      />
      <Textarea
        defaultValue="工作日午餐"
        helperText="跟随快捷模板，不可编辑"
        labelText="关联模板"
        minRows={1}
        disabled
      />
    </Column>
  );
}

export default TextareaStatusDemo;
