import React from 'react';
import { Column, Text, Textarea } from '@pennyspring/ui';

export const textareaSlotsDemoTitle = '插槽与行数（slots）';

export function TextareaSlotsDemo() {
  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        label &gt; labelText，error &gt; helper；计数超过 84% 转警示色；加载转圈替换计数位
      </Text>
      <Textarea
        helperText="会出现在账单明细里"
        labelText="备注"
        maxLength={200}
        placeholder="例如：工作日午餐"
        required
        showCount
      />
      <Textarea
        errorText="小票号已被另一笔记录使用"
        helperText="会出现在账单明细里"
        labelText="小票号"
        minRows={1}
        placeholder="2026-1026-0031"
        showCount
        status="error"
      />
      <Textarea
        defaultValue="十月份聚餐分摊：人均 64 元，共 6 人。"
        helperText="已达 6 行上限，更多内容在字段内滚动"
        labelText="备注"
        maxLength={200}
        maxRows={6}
        minRows={3}
        showCount
        status="warning"
      />
      <Textarea
        defaultValue="正在识别小票内容…"
        labelText="识别结果"
        loading
      />
      <Textarea label={null} placeholder="没有标签时靠外部标题说明字段含义" />
    </Column>
  );
}

export default TextareaSlotsDemo;
