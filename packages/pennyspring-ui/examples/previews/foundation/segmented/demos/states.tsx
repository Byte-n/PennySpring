import React from 'react';
import { Column, Segmented, Text } from '@pennyspring/ui';

export function SegmentedStatesDemo() {
  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        未选二级文字；选中白块 + 投影 + colorText 600；按压只作用于未选项（colorFillSecondary）
      </Text>
      <Segmented
        defaultValue="income"
        options={[
          { label: '支出', value: 'expense' },
          { label: '收入', value: 'income' },
          { label: '转账', value: 'transfer' },
        ]}
      />
      <Text color="tertiary" size="sm">
        禁用：轨道 colorFillQuaternary，文字四级；选中块降为 colorFillTertiary 并去投影
      </Text>
      <Segmented
        disabled
        defaultValue="income"
        options={[
          { label: '支出', value: 'expense' },
          { label: '收入', value: 'income' },
          { label: '转账', value: 'transfer' },
        ]}
      />
      <Text color="tertiary" size="sm">
        单项禁用：只降该项文字，点击不改变选中值
      </Text>
      <Segmented
        defaultValue="quarter"
        options={[
          { label: '本月', value: 'month' },
          { label: '近 3 月', value: 'quarter' },
          { disabled: true, label: '自定义', value: 'custom' },
        ]}
      />
    </Column>
  );
}

export default SegmentedStatesDemo;
