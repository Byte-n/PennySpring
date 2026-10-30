import React from 'react';
import { Column, Tabs, Text } from '@pennyspring/ui';

const ITEMS = [
  { label: '概览', value: 'overview' },
  { label: '明细', value: 'records' },
  { label: '图表', value: 'trend' },
];

export function TabsStatesDemo() {
  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        未选三级文字、无下划线；选中 colorPrimary 600 + 2px 下划线；按压是 8 圆角 colorFillTertiary
      </Text>
      <Tabs defaultValue="records" items={ITEMS} />
      <Text color="tertiary" size="sm">
        禁用：文字四级、无下划线、不响应点击；选中项再点不会重复上报
      </Text>
      <Tabs
        defaultValue="records"
        items={[
          { label: '明细', value: 'records' },
          { disabled: true, label: '图表（未开放）', value: 'trend' },
        ]}
      />
      <Tabs
        disabled
        defaultValue="overview"
        items={[
          { label: '概览', value: 'overview' },
          { label: '明细', value: 'records' },
        ]}
      />
    </Column>
  );
}

export default TabsStatesDemo;
