import { ICON } from '@pennyspring/data';

import type { TypeIconGroupNode } from '../typeIconTree';

import TransferAccountTransferIcon from '../../assets/icon/transfer/account_transfer.svg';
import TransferCreditCardPaymentIcon from '../../assets/icon/transfer/credit_card_payment.svg';
import TransferWithdrawalsIcon from '../../assets/icon/transfer/withdrawals.svg';
import TransferDepositIcon from '../../assets/icon/transfer/deposit.svg';
import TransferBorrowIcon from '../../assets/icon/transfer/borrow.svg';
import TransferLendIcon from '../../assets/icon/transfer/lend.svg';
import TransferRepaymentIcon from '../../assets/icon/transfer/repayment.svg';
import TransferProceedsIcon from '../../assets/icon/transfer/proceeds.svg';

export const transferTypeIconGroup = {
  key: 'transfer',
  label: '转账',
  children: [
    {
      value: ICON.accountTransfer,
      label: ICON.label(ICON.accountTransfer),
      icon: TransferAccountTransferIcon,
    },
    {
      value: ICON.creditCardPayment,
      label: ICON.label(ICON.creditCardPayment),
      icon: TransferCreditCardPaymentIcon,
    },
    {
      value: ICON.withdrawals,
      label: ICON.label(ICON.withdrawals),
      icon: TransferWithdrawalsIcon,
    },
    {
      value: ICON.deposit,
      label: ICON.label(ICON.deposit),
      icon: TransferDepositIcon,
    },
    {
      value: ICON.borrow,
      label: ICON.label(ICON.borrow),
      icon: TransferBorrowIcon,
    },
    {
      value: ICON.lend,
      label: ICON.label(ICON.lend),
      icon: TransferLendIcon,
    },
    {
      value: ICON.repayment,
      label: ICON.label(ICON.repayment),
      icon: TransferRepaymentIcon,
    },
    {
      value: ICON.proceeds,
      label: ICON.label(ICON.proceeds),
      icon: TransferProceedsIcon,
    },
  ],
} as const satisfies TypeIconGroupNode;
