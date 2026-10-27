import React from 'react';
import { Checkbox, Column, Text } from '@pennyspring/ui';

export const checkboxStatesDemoTitle = '状态（5 种）';

export function CheckboxStatesDemo() {
  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        未选白底 + 1px colorBorder；选中 colorPrimary 实底 + 白色勾；半选为白色横杠（Icon minus）；按压整行 colorFillTertiary + 8 圆角
      </Text>
      <Checkbox>保存记录</Checkbox>
      <Checkbox defaultValue>存为模板</Checkbox>
      <Checkbox indeterminate>部分选中（3 / 8）</Checkbox>
      <Text color="tertiary" size="sm">
        禁用：框底 colorFillQuaternary + colorSplit 描边，文字三级 colorTextTertiary
      </Text>
      <Checkbox disabled>删除这笔记录</Checkbox>
      <Checkbox defaultValue disabled>删除这笔记录</Checkbox>
      <Checkbox indeterminate disabled>部分选中（3 / 8）</Checkbox>
      <Text color="tertiary" size="sm">
        只读：保留主色底与白色勾，文字二级 colorTextSecondary，不响应按压
      </Text>
      <Checkbox defaultValue readonly>已导入的账单</Checkbox>
      <Checkbox readonly>未勾选的只读结果</Checkbox>
    </Column>
  );
}

export default CheckboxStatesDemo;
