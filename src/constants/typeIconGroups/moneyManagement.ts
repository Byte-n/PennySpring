import {
  ChartLineUpIcon,
  ChartBarIcon,
  PiggyBankIcon,
  CoinVerticalIcon,
  CertificateIcon,
  CurrencyCircleDollarIcon,
  ReceiptIcon,
} from 'phosphor-react-native';
import { ICON } from '@pennyspring/data';

import type { TypeIconGroupNode } from '../typeIconTree';

export const moneyManagementTypeIconGroup = {
  key: 'money-management',
  label: '理财',
  children: [
    { value: ICON.stock, label: ICON.label(ICON.stock), icon: ChartLineUpIcon },
    { value: ICON.fund, label: ICON.label(ICON.fund), icon: ChartBarIcon },
    { value: ICON.moneyManagement, label: ICON.label(ICON.moneyManagement), icon: PiggyBankIcon },
    { value: ICON.gold, label: ICON.label(ICON.gold), icon: CoinVerticalIcon },
    { value: ICON.bond, label: ICON.label(ICON.bond), icon: CertificateIcon },
    { value: ICON.forex, label: ICON.label(ICON.forex), icon: CurrencyCircleDollarIcon },
    { value: ICON.charge, label: ICON.label(ICON.charge), icon: ReceiptIcon },
  ],
} as const satisfies TypeIconGroupNode;
