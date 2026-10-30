import React from 'react';
import { List, Row, Text } from '@pennyspring/ui';
import type { ListItemData } from '@pennyspring/ui';

const ROWS: ListItemData[] = [
  {
    icon: 'list',
    titleText: '餐饮 · 外卖',
    right: <Text color="error" weight="semibold">-¥128.00</Text>,
  },
  {
    icon: 'home',
    titleText: '房租',
    descriptionText: '固定支出 · 1 笔',
    right: <Text color="error" weight="semibold">-¥2,400.00</Text>,
  },
  {
    titleText: '本月结余',
    right: <Text color="success" weight="semibold">+¥8,420.15</Text>,
  },
  {
    icon: 'user',
    titleText: '工资入账',
    descriptionText: '已到账 · 招商银行',
    right: <Text color="success" weight="semibold">+¥12,800.00</Text>,
  },
  {
    icon: 'star',
    titleText: '餐饮',
    descriptionText: '3 个二级分类',
    right: (
      <Row align="center" gap="small">
        <Text color="default" weight="semibold">¥1,286.50</Text>
        <Text color="tertiary">›</Text>
      </Row>
    ),
  },
  {
    icon: 'settings',
    selected: true,
    titleText: '已选中',
    descriptionText: '可批量打标签',
  },
  {
    icon: 'list',
    disabled: true,
    titleText: '已归档账本',
    descriptionText: '只读，不可切换',
    right: <Text color="tertiary" weight="semibold">¥0.00</Text>,
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
