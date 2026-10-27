import React from 'react';
import { List, Text, Column } from '@pennyspring/ui';
import type { ListItemData } from '@pennyspring/ui';

const EXPENSE_ROWS: ListItemData[] = [
  { amountText: { tone: 'expense', value: '128.00' }, icon: 'list', titleText: '餐饮 · 外卖' },
];

const INCOME_ROWS: ListItemData[] = [
  { amountText: { tone: 'income', value: '12800' }, icon: 'user', titleText: '工资入账' },
];

const NEUTRAL_ROWS: ListItemData[] = [
  { amountText: { value: '2000' }, icon: 'share', titleText: '转账' },
];

const EMPTY_ROWS: ListItemData[] = [
  { icon: 'warning', titleText: '待补全金额', right: '—' },
];

export const listAmountDemoTitle = '金额样式（tone）';

export function ListAmountDemo() {
  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        金额 16/600 等宽右对齐；符号与小数 13；支出红、收入绿只作辅助，符号必须出现；无金额用 —
      </Text>
      <List<ListItemData> data={EXPENSE_ROWS} header="支出 expense" />
      <List<ListItemData> data={INCOME_ROWS} header="收入 income" />
      <List<ListItemData> data={NEUTRAL_ROWS} header="中性 neutral" />
      <List<ListItemData> data={EMPTY_ROWS} header="无金额" />
    </Column>
  );
}

export default ListAmountDemo;
