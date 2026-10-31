import React from 'react';
import { List } from '@pennyspring/ui';
import type { ListItemData, ListSectionData } from '@pennyspring/ui';

const SECTIONS: ListSectionData<ListItemData>[] = [
  {
    key: 'accounts',
    titleText: '账户概览',
    countText: '2',
    data: [
      {
        value: 'cash',
        icon: 'home',
        titleText: '现金账户',
        descriptionText: '日常备用金',
        metrics: [
          { key: 'balance', label: '余额', value: '¥8,420.15' },
          { key: 'change', label: '本月变化', value: '+¥1,280', tone: 'success' },
        ],
      },
      {
        value: 'card',
        icon: 'list',
        titleText: '信用卡',
        descriptionText: '每月 12 日出账',
        badgeText: '待还款',
        metrics: [
          { key: 'balance', label: '待还', value: '¥1,286.50', tone: 'warning' },
          { key: 'limit', label: '额度', value: '¥20,000' },
        ],
      },
    ],
  },
];

export function ListDataDrivenDemo() {
  return <List<ListItemData> sections={SECTIONS} scrollEnabled={false} />;
}

export default ListDataDrivenDemo;
