import React, { useState } from 'react';
import { List, Text, Column } from '@pennyspring/ui';
import type { ListItemData } from '@pennyspring/ui';

const EXPENSE_ROWS: ListItemData[] = [
  { amountText: { tone: 'expense', value: '1286.50' }, icon: 'list', titleText: '餐饮' },
  { amountText: { tone: 'expense', value: '693.35' }, icon: 'home', titleText: '交通' },
];

export const listCollapsibleDemoTitle = '分组头与分隔线';

export function ListCollapsibleDemo() {
  const [open, setOpen] = useState(true);

  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        分组头 32 高无底色，箭头 16 旋转 90°；分隔线从 66 起与标题左缘对齐，首末行不画
      </Text>
      <List<ListItemData>
        collapsible
        data={EXPENSE_ROWS}
        titleText="支出分类 · 2"
        open={open}
        onOpenChange={setOpen}
        footer="合计 ¥1,979.85"
        keyExtractor={item => item.titleText ?? ''}
        scrollEnabled={false}
      />
    </Column>
  );
}

export default ListCollapsibleDemo;
