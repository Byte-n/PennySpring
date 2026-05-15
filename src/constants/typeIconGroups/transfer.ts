import {
  ArrowsLeftRightIcon,
  CreditCardIcon,
  ArrowLineUpIcon,
  ArrowLineDownIcon,
  HandWithdrawIcon,
  HandDepositIcon,
  ArrowULeftDownIcon,
  CoinsIcon,
} from 'phosphor-react-native';
import { ICON } from '@pennyspring/data';

import type { TypeIconGroupNode } from '../typeIconTree';

export const transferTypeIconGroup = {
  key: 'transfer',
  label: '转账',
  children: [
    { value: ICON.accountTransfer, label: ICON.label(ICON.accountTransfer), icon: ArrowsLeftRightIcon },
    { value: ICON.creditCardPayment, label: ICON.label(ICON.creditCardPayment), icon: CreditCardIcon },
    { value: ICON.withdrawals, label: ICON.label(ICON.withdrawals), icon: ArrowLineUpIcon },
    { value: ICON.deposit, label: ICON.label(ICON.deposit), icon: ArrowLineDownIcon },
    { value: ICON.borrow, label: ICON.label(ICON.borrow), icon: HandWithdrawIcon },
    { value: ICON.lend, label: ICON.label(ICON.lend), icon: HandDepositIcon },
    { value: ICON.repayment, label: ICON.label(ICON.repayment), icon: ArrowULeftDownIcon },
    { value: ICON.proceeds, label: ICON.label(ICON.proceeds), icon: CoinsIcon },
  ],
} as const satisfies TypeIconGroupNode;
