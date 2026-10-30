import React from 'react';
import { Column, Radio, Text } from '@pennyspring/ui';

export function RadioStatesDemo() {
  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        未选：2px colorBorder 外圈 + colorBgContainer 底；选中：主色描边 + 主色圆点，标签仍为 colorText
      </Text>
      <Radio>未选中</Radio>
      <Radio defaultValue>已选中</Radio>
      <Text color="tertiary" size="sm">
        按压：整行 colorFillTertiary + 8 圆角，不缩放（实机上按住查看）
      </Text>
      <Text color="tertiary" size="sm">
        禁用：外圈 colorSplit + colorFillQuaternary 底，圆点 colorTextQuaternary，文字三级 colorTextTertiary
      </Text>
      <Radio disabled>不可修改（未选）</Radio>
      <Radio defaultValue disabled>不可修改（已选）</Radio>
      <Text color="tertiary" size="sm">
        只读：保留主色圆点，标签二级 colorTextSecondary，不响应按压
      </Text>
      <Radio readonly>只读结果（未选）</Radio>
      <Radio defaultValue readonly>统计方式：按分类</Radio>
      <Text color="tertiary" size="sm">
        单选语义：已选中的选项再次点击不会取消，与 Checkbox 的关键差别
      </Text>
      <Radio defaultValue>已选中，再点不取消</Radio>
    </Column>
  );
}

export default RadioStatesDemo;
