import { ICON } from '@pennyspring/data';

import type { TypeIconGroupNode } from '../typeIconTree';

import IncomeSalaryIcon from '../../assets/icon/income/salary.svg';
import IncomeBonusIcon from '../../assets/icon/income/bonus.svg';
import IncomeRoyaltyIcon from '../../assets/icon/income/royalty.svg';
import IncomeRefundIcon from '../../assets/icon/income/refund.svg';
import IncomeReimburseIcon from '../../assets/icon/income/reimburse.svg';
import IncomeInvestmentIcon from '../../assets/icon/income/investment.svg';
import IncomeProvidentFundIcon from '../../assets/icon/income/provident_fund.svg';
import IncomeMedicareIcon from '../../assets/icon/income/medicare.svg';
import IncomeAlimonyIcon from '../../assets/icon/income/alimony.svg';
import IncomePocketMoneyIcon from '../../assets/icon/income/pocket_money.svg';
import IncomeLuckyMoneyIcon from '../../assets/icon/income/lucky_money.svg';
import IncomeConvertPaymentIcon from '../../assets/icon/income/convert_payment.svg';
import IncomeWindfallIcon from '../../assets/icon/income/windfall.svg';
import IncomeRentIcon from '../../assets/icon/income/rent.svg';
import IncomeTaxRebateIcon from '../../assets/icon/income/tax_rebate.svg';
import IncomeDividendIcon from '../../assets/icon/income/dividend.svg';
import IncomeScholarshipIcon from '../../assets/icon/income/scholarship.svg';
import IncomeBenefitIcon from '../../assets/icon/income/benefit.svg';

export const incomeTypeIconGroup = {
  key: 'income',
  label: '收入',
  children: [
    {
      value: ICON.salary,
      label: ICON.label(ICON.salary),
      icon: IncomeSalaryIcon,
    },
    {
      value: ICON.bonus,
      label: ICON.label(ICON.bonus),
      icon: IncomeBonusIcon,
    },
    {
      value: ICON.royalty,
      label: ICON.label(ICON.royalty),
      icon: IncomeRoyaltyIcon,
    },
    {
      value: ICON.refund,
      label: ICON.label(ICON.refund),
      icon: IncomeRefundIcon,
    },
    {
      value: ICON.reimburse,
      label: ICON.label(ICON.reimburse),
      icon: IncomeReimburseIcon,
    },
    {
      value: ICON.investment,
      label: ICON.label(ICON.investment),
      icon: IncomeInvestmentIcon,
    },
    {
      value: ICON.providentFund,
      label: ICON.label(ICON.providentFund),
      icon: IncomeProvidentFundIcon,
    },
    {
      value: ICON.medicare,
      label: ICON.label(ICON.medicare),
      icon: IncomeMedicareIcon,
    },
    {
      value: ICON.alimony,
      label: ICON.label(ICON.alimony),
      icon: IncomeAlimonyIcon,
    },
    {
      value: ICON.pocketMoney,
      label: ICON.label(ICON.pocketMoney),
      icon: IncomePocketMoneyIcon,
    },
    {
      value: ICON.luckyMoney,
      label: ICON.label(ICON.luckyMoney),
      icon: IncomeLuckyMoneyIcon,
    },
    {
      value: ICON.convertPayment,
      label: ICON.label(ICON.convertPayment),
      icon: IncomeConvertPaymentIcon,
    },
    {
      value: ICON.windfall,
      label: ICON.label(ICON.windfall),
      icon: IncomeWindfallIcon,
    },
    {
      value: ICON.rent,
      label: ICON.label(ICON.rent),
      icon: IncomeRentIcon,
    },
    {
      value: ICON.taxRebate,
      label: ICON.label(ICON.taxRebate),
      icon: IncomeTaxRebateIcon,
    },
    {
      value: ICON.dividend,
      label: ICON.label(ICON.dividend),
      icon: IncomeDividendIcon,
    },
    {
      value: ICON.scholarship,
      label: ICON.label(ICON.scholarship),
      icon: IncomeScholarshipIcon,
    },
    {
      value: ICON.benefit,
      label: ICON.label(ICON.benefit),
      icon: IncomeBenefitIcon,
    },
  ],
} as const satisfies TypeIconGroupNode;
