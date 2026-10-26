import React, { useState } from 'react';
import { List } from '@pennyspring/ui';
import type { ListItemData } from '@pennyspring/ui';

const COLLAPSIBLE_ROWS: ListItemData[] = [
  {
    titleText: '本月收入',
    descriptionText: '已到账 2 笔',
    right: '¥ 12,800.00',
  },
  {
    titleText: '本月支出',
    descriptionText: '已记录 18 笔',
    right: '¥ 5,420.00',
  },
];

export const listCollapsibleDemoTitle = 'Collapsible';

export function ListCollapsibleDemo() {
  const [open, setOpen] = useState(true);

  return (
    <List<ListItemData>
      collapsible
      data={COLLAPSIBLE_ROWS}
      titleText="本月概览"
      open={open}
      onOpenChange={setOpen}
      keyExtractor={item => item.titleText ?? ''}
    />
  );
}

export default ListCollapsibleDemo;
