import React from 'react';
import { List } from '@pennyspring/ui';
import type { ListItemData } from '@pennyspring/ui';

const ROWS: ListItemData[] = [
  {
    icon: 'list',
    titleText: '餐饮 · 外卖',
    amountText: { tone: 'expense', value: '128.00' },
  },
  {
    icon: 'home',
    titleText: '房租',
    descriptionText: '固定支出 · 1 笔',
    amountText: { tone: 'expense', value: '2400' },
  },
  {
    titleText: '本月结余',
    amountText: { tone: 'income', value: '8420.15' },
  },
  {
    icon: 'user',
    titleText: '工资入账',
    descriptionText: '已到账 · 招商银行',
    amountText: { tone: 'income', value: '12800' },
  },
  {
    icon: 'star',
    titleText: '餐饮',
    descriptionText: '3 个二级分类',
    amountText: { value: '1286.50' },
    right: '›',
  },
  {
    icon: 'settings',
    selected: true,
    titleText: '已选中',
    descriptionText: '可批量打标签',
    amountText: { value: '28' },
  },
  {
    icon: 'list',
    disabled: true,
    titleText: '已归档账本',
    descriptionText: '只读，不可切换',
    amountText: { value: '0' },
  },
  {
    icon: 'warning',
    titleText: '待补全分类',
    descriptionText: '来自导入，需要补充分类',
  },
];

export function ListRowsDemo() {
  return (
    <List<ListItemData>
      data={ROWS}
      header="十月账单"
      footer="共 8 种行结构"
      keyExtractor={item => item.titleText ?? ''}
      scrollEnabled={false}
    />
  );
}

export default ListRowsDemo;
