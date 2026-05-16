import React from 'react';
import { TopTabNavigator, type TabScreen } from '@pennyspring/component';

import { ExpenseTabScreen } from '../screens/addRecord/tabs/ExpenseTabScreen';
import { IncomeTabScreen } from '../screens/addRecord/tabs/IncomeTabScreen';
import { TransferTabScreen } from '../screens/addRecord/tabs/TransferTabScreen';

const ADD_RECORD_TAB_SCREENS: readonly TabScreen[] = [
  {
    name: 'ExpenseTab',
    label: '支出',
    component: ExpenseTabScreen,
  },
  {
    name: 'IncomeTab',
    label: '收入',
    component: IncomeTabScreen,
  },
  {
    name: 'TransferTab',
    label: '转账',
    component: TransferTabScreen,
  },
];

export function AddRecordTabsNavigator() {
  return <TopTabNavigator screens={ADD_RECORD_TAB_SCREENS} />;
}
