import {
  BriefcaseIcon,
  CoinIcon,
  CrownIcon,
  ArrowULeftDownIcon,
  ReceiptIcon,
  ChartLineUpIcon,
  BankIcon,
  FirstAidKitIcon,
  HandHeartIcon,
  WalletIcon,
  HandCoinsIcon,
  CurrencyCnyIcon,
  ShootingStarIcon,
  HouseIcon,
  ReceiptXIcon,
  ChartPieSliceIcon,
  GraduationCapIcon,
  GiftIcon,
} from 'phosphor-react-native';
import { ICON } from '@pennyspring/data';

import type { TypeIconGroupNode } from '../typeIconTree';

export const incomeTypeIconGroup = {
  key: 'income',
  label: '收入',
  children: [
    { value: ICON.salary, label: ICON.label(ICON.salary), icon: BriefcaseIcon },
    { value: ICON.bonus, label: ICON.label(ICON.bonus), icon: CoinIcon },
    { value: ICON.royalty, label: ICON.label(ICON.royalty), icon: CrownIcon },
    { value: ICON.refund, label: ICON.label(ICON.refund), icon: ArrowULeftDownIcon },
    { value: ICON.reimburse, label: ICON.label(ICON.reimburse), icon: ReceiptIcon },
    { value: ICON.investment, label: ICON.label(ICON.investment), icon: ChartLineUpIcon },
    { value: ICON.providentFund, label: ICON.label(ICON.providentFund), icon: BankIcon },
    { value: ICON.medicare, label: ICON.label(ICON.medicare), icon: FirstAidKitIcon },
    { value: ICON.alimony, label: ICON.label(ICON.alimony), icon: HandHeartIcon },
    { value: ICON.pocketMoney, label: ICON.label(ICON.pocketMoney), icon: WalletIcon },
    { value: ICON.luckyMoney, label: ICON.label(ICON.luckyMoney), icon: HandCoinsIcon },
    { value: ICON.convertPayment, label: ICON.label(ICON.convertPayment), icon: CurrencyCnyIcon },
    { value: ICON.windfall, label: ICON.label(ICON.windfall), icon: ShootingStarIcon },
    { value: ICON.rent, label: ICON.label(ICON.rent), icon: HouseIcon },
    { value: ICON.taxRebate, label: ICON.label(ICON.taxRebate), icon: ReceiptXIcon },
    { value: ICON.dividend, label: ICON.label(ICON.dividend), icon: ChartPieSliceIcon },
    { value: ICON.scholarship, label: ICON.label(ICON.scholarship), icon: GraduationCapIcon },
    { value: ICON.benefit, label: ICON.label(ICON.benefit), icon: GiftIcon },
  ],
} as const satisfies TypeIconGroupNode;
