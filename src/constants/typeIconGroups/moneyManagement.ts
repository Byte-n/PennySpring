import { ICON } from '@pennyspring/data';

import type { TypeIconGroupNode } from '../typeIconTree';

import MoneyManagementStockIcon from '../../assets/icon/money-management/stock.svg';
import MoneyManagementFundIcon from '../../assets/icon/money-management/fund.svg';
import MoneyManagementMoneyManagementIcon from '../../assets/icon/money-management/money_management.svg';
import MoneyManagementGoldIcon from '../../assets/icon/money-management/gold.svg';
import MoneyManagementBondIcon from '../../assets/icon/money-management/bond.svg';
import MoneyManagementForexIcon from '../../assets/icon/money-management/forex.svg';
import MoneyManagementChargeIcon from '../../assets/icon/money-management/charge.svg';

export const moneyManagementTypeIconGroup = {
  key: 'money-management',
  label: '理财',
  children: [
    {
      value: ICON.stock,
      label: ICON.label(ICON.stock),
      icon: MoneyManagementStockIcon,
    },
    {
      value: ICON.fund,
      label: ICON.label(ICON.fund),
      icon: MoneyManagementFundIcon,
    },
    {
      value: ICON.moneyManagement,
      label: ICON.label(ICON.moneyManagement),
      icon: MoneyManagementMoneyManagementIcon,
    },
    {
      value: ICON.gold,
      label: ICON.label(ICON.gold),
      icon: MoneyManagementGoldIcon,
    },
    {
      value: ICON.bond,
      label: ICON.label(ICON.bond),
      icon: MoneyManagementBondIcon,
    },
    {
      value: ICON.forex,
      label: ICON.label(ICON.forex),
      icon: MoneyManagementForexIcon,
    },
    {
      value: ICON.charge,
      label: ICON.label(ICON.charge),
      icon: MoneyManagementChargeIcon,
    },
  ],
} as const satisfies TypeIconGroupNode;
