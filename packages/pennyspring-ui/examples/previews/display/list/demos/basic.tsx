import React from 'react';
import { List } from '@pennyspring/ui';
import type { ListItemData } from '@pennyspring/ui';
import { AirplaneIcon, HouseIcon, WalletIcon } from 'phosphor-react-native';

const ACCOUNT_ROWS: ListItemData[] = [
  {
    titleText: '日常账户',
    descriptionText: '用于固定支出和日常消费',
    left: <WalletIcon />,
    right: '¥ 3,280.00',
  },
  {
    titleText: '旅行储蓄',
    descriptionText: '下个月的周末旅行计划',
    left: <AirplaneIcon />,
    right: '¥ 1,240.00',
  },
  {
    titleText: '家庭共享',
    descriptionText: '与家人共同使用',
    left: <HouseIcon />,
    right: '¥ 860.00',
    disabled: true,
  },
];

export const listBasicDemoTitle = 'Basic';

export function ListBasicDemo() {
  return (
    <List<ListItemData>
      data={ACCOUNT_ROWS}
      header="账户列表"
      footer="共 3 个账户"
      keyExtractor={item => item.titleText ?? ''}
    />
  );
}

export default ListBasicDemo;
