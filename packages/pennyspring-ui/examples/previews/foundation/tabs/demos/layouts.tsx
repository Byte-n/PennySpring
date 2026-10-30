import React from 'react';
import { Column, Tabs, Text } from '@pennyspring/ui';
import type { TabsValue } from '@pennyspring/ui';

const WRAP_ITEMS = [
  { label: '食品餐饮', value: 'food' },
  { label: '交通出行', value: 'traffic' },
  { label: '居家水电', value: 'home' },
  { label: '休闲娱乐', value: 'fun' },
  { label: '医疗健康', value: 'health' },
  { label: '其他', value: 'other' },
];

const SCROLL_ITEMS = [
  { label: '全部账本', value: 'all' },
  { label: '十月账单', value: 'oct' },
  { label: '旅行账本', value: 'travel' },
  { label: '家庭共享', value: 'family' },
  { label: '实验数据', value: 'lab' },
];

const BLOCK_ITEMS = [
  { label: '支出', value: 'expense' },
  { label: '收入', value: 'income' },
  { label: '转账', value: 'transfer' },
];

export function TabsLayoutsDemo() {
  const [value, setValue] = React.useState<TabsValue>('overview');

  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        wrap（默认）：超过一行自动换行，行间距 4，下划线跟随选中项自身底部
      </Text>
      <Tabs defaultValue="food" items={WRAP_ITEMS} />
      <Text color="tertiary" size="sm">
        scroll：tab 不压缩，横向滚动，右侧渐隐由业务实现
      </Text>
      <Tabs defaultValue="all" items={SCROLL_ITEMS} layout="scroll" />
      <Text color="tertiary" size="sm">
        block：标签保持内容宽，剩余空间均分铺满整行；放不下时整项换行
      </Text>
      <Tabs block defaultValue="income" items={BLOCK_ITEMS} />
      <Text color="tertiary" size="sm">
        选中与面板：面板距列表线 16，切换只换内容、不移动列表
      </Text>
      <Tabs
        items={[
          { label: '概览', value: 'overview' },
          { label: '明细', value: 'records' },
          { label: '图表', value: 'trend' },
        ]}
        onChange={setValue}
        renderContent={item => (
          <Text color="secondary" size="sm">
            当前面板：{String(item.value)}（受控值 {String(value)}）
          </Text>
        )}
        value={value}
      />
    </Column>
  );
}

export default TabsLayoutsDemo;
