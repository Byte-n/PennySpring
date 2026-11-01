import React from 'react';
import { Column, List, Text } from '@pennyspring/ui';
import type { ListItemData } from '@pennyspring/ui';

const EXPENSE_ROWS: ListItemData[] = [
  {
    icon: 'list',
    right: (
      <Text color="error" weight="semibold">
        -¥128.00
      </Text>
    ),
    titleText: '餐饮 · 外卖',
  },
];

const INCOME_ROWS: ListItemData[] = [
  {
    icon: 'user',
    right: (
      <Text color="success" weight="semibold">
        +¥12,800.00
      </Text>
    ),
    titleText: '工资入账',
  },
];

const NEUTRAL_ROWS: ListItemData[] = [
  {
    icon: 'share',
    right: (
      <Text color="default" weight="semibold">
        ¥2,000.00
      </Text>
    ),
    titleText: '转账',
  },
];

const EMPTY_ROWS: ListItemData[] = [
  { icon: 'warning', titleText: '待补全金额', right: '—' },
];

export function ListRightDemo() {
  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        行尾内容统一走 right
        插槽；金额的格式、符号与语义色由业务侧自行实现，组件不再内置金额规则
      </Text>
      <List<ListItemData>
        data={EXPENSE_ROWS}
        header="支出 expense"
        scrollEnabled={false}
      />
      <List<ListItemData>
        data={INCOME_ROWS}
        header="收入 income"
        scrollEnabled={false}
      />
      <List<ListItemData>
        data={NEUTRAL_ROWS}
        header="中性 neutral"
        scrollEnabled={false}
      />
      <List<ListItemData>
        data={EMPTY_ROWS}
        header="无行尾内容"
        scrollEnabled={false}
      />
    </Column>
  );
}

export default ListRightDemo;
