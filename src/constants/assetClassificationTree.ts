import type { ComponentType } from 'react';
import type { SvgProps } from 'react-native-svg';

import { ASSET_CLASSIFICATION, ASSET_TYPE } from '@pennyspring/api';

import BankBjIcon from '../assets/asset-icons/bank/bank_bj.svg';
import BankGdIcon from '../assets/asset-icons/bank/bank_gd.svg';
import BankGfIcon from '../assets/asset-icons/bank/bank_gf.svg';
import BankGsIcon from '../assets/asset-icons/bank/bank_gs.svg';
import BankHxIcon from '../assets/asset-icons/bank/bank_hx.svg';
import BankJsIcon from '../assets/asset-icons/bank/bank_js.svg';
import BankJtIcon from '../assets/asset-icons/bank/bank_jt.svg';
import BankMsIcon from '../assets/asset-icons/bank/bank_ms.svg';
import BankNyIcon from '../assets/asset-icons/bank/bank_ny.svg';
import BankPfIcon from '../assets/asset-icons/bank/bank_pf.svg';
import BankXyIcon from '../assets/asset-icons/bank/bank_xy.svg';
import BankYzIcon from '../assets/asset-icons/bank/bank_yz.svg';
import BankZgIcon from '../assets/asset-icons/bank/bank_zg.svg';
import BankZsIcon from '../assets/asset-icons/bank/bank_zs.svg';
import BankZxIcon from '../assets/asset-icons/bank/bank_zx.svg';
import AssetCircleIcon from '../assets/asset-icons/capital-account/asset_circle.svg';
import CashCircleIcon from '../assets/asset-icons/capital-account/cash_circle.svg';
import AntCreditPayCircleIcon from '../assets/asset-icons/credit-card/ant_credit_pay_circle.svg';
import CreditCardCircleIcon from '../assets/asset-icons/credit-card/credit_card_circle.svg';
import CreditCardOtherCircleIcon from '../assets/asset-icons/credit-card/credit_card_other_circle.svg';
import DouyinMonthCircleIcon from '../assets/asset-icons/credit-pay/douyin_month_circle.svg';
import JingdongCircleIcon from '../assets/asset-icons/credit-pay/jingdong_circle.svg';
import BorrowCircleIcon from '../assets/asset-icons/debt/borrow_circle.svg';
import LendCircleIcon from '../assets/asset-icons/debt/lend_circle.svg';
import FinancialCircleIcon from '../assets/asset-icons/investment/financial_circle.svg';
import FundCircleIcon from '../assets/asset-icons/investment/fund_circle.svg';
import StockCircleIcon from '../assets/asset-icons/investment/stock_circle.svg';
import BankCardCircleIcon from '../assets/asset-icons/shared/bank_card_circle.svg';
import BusCardCircleIcon from '../assets/asset-icons/stored-value-card/bus_card_circle.svg';
import DepositCircleIcon from '../assets/asset-icons/stored-value-card/deposit_circle.svg';
import MealCardCircleIcon from '../assets/asset-icons/stored-value-card/meal_card_circle.svg';
import MemberCardCircleIcon from '../assets/asset-icons/stored-value-card/member_card_circle.svg';
import PhoneChargeCircleIcon from '../assets/asset-icons/stored-value-card/phone_charge_circle.svg';
import RechargeableCardCircleIcon from '../assets/asset-icons/stored-value-card/rechargeable_card_circle.svg';
import AlipayCircleIcon from '../assets/asset-icons/wallet/alipay_circle.svg';
import DouyinCircleIcon from '../assets/asset-icons/wallet/douyin_circle.svg';
import WechatCircleIcon from '../assets/asset-icons/wallet/wechat_circle.svg';

export type AssetTypeValue = ReturnType<typeof ASSET_TYPE.values>[number];
export type AssetClassificationValue = ReturnType<
  typeof ASSET_CLASSIFICATION.values
>[number];
export type AssetClassificationTreeValue =
  | AssetTypeValue
  | AssetClassificationValue;
export type AssetClassificationIcon = ComponentType<SvgProps>;

export interface AssetClassificationTreeNode {
  value: AssetClassificationTreeValue;
  label: string;
  icon: AssetClassificationIcon;
  children?: readonly AssetClassificationTreeNode[];
}

const BANK_CARD_DETAIL_NODES = [
  {
    value: ASSET_CLASSIFICATION.bankCardZg,
    label: ASSET_CLASSIFICATION.label(ASSET_CLASSIFICATION.bankCardZg),
    icon: BankZgIcon,
  },
  {
    value: ASSET_CLASSIFICATION.bankCardZs,
    label: ASSET_CLASSIFICATION.label(ASSET_CLASSIFICATION.bankCardZs),
    icon: BankZsIcon,
  },
  {
    value: ASSET_CLASSIFICATION.bankCardGs,
    label: ASSET_CLASSIFICATION.label(ASSET_CLASSIFICATION.bankCardGs),
    icon: BankGsIcon,
  },
  {
    value: ASSET_CLASSIFICATION.bankCardNy,
    label: ASSET_CLASSIFICATION.label(ASSET_CLASSIFICATION.bankCardNy),
    icon: BankNyIcon,
  },
  {
    value: ASSET_CLASSIFICATION.bankCardJs,
    label: ASSET_CLASSIFICATION.label(ASSET_CLASSIFICATION.bankCardJs),
    icon: BankJsIcon,
  },
  {
    value: ASSET_CLASSIFICATION.bankCardJt,
    label: ASSET_CLASSIFICATION.label(ASSET_CLASSIFICATION.bankCardJt),
    icon: BankJtIcon,
  },
  {
    value: ASSET_CLASSIFICATION.bankCardYz,
    label: ASSET_CLASSIFICATION.label(ASSET_CLASSIFICATION.bankCardYz),
    icon: BankYzIcon,
  },
  {
    value: ASSET_CLASSIFICATION.bankCardHx,
    label: ASSET_CLASSIFICATION.label(ASSET_CLASSIFICATION.bankCardHx),
    icon: BankHxIcon,
  },
  {
    value: ASSET_CLASSIFICATION.bankCardBj,
    label: ASSET_CLASSIFICATION.label(ASSET_CLASSIFICATION.bankCardBj),
    icon: BankBjIcon,
  },
  {
    value: ASSET_CLASSIFICATION.bankCardMs,
    label: ASSET_CLASSIFICATION.label(ASSET_CLASSIFICATION.bankCardMs),
    icon: BankMsIcon,
  },
  {
    value: ASSET_CLASSIFICATION.bankCardGd,
    label: ASSET_CLASSIFICATION.label(ASSET_CLASSIFICATION.bankCardGd),
    icon: BankGdIcon,
  },
  {
    value: ASSET_CLASSIFICATION.bankCardZx,
    label: ASSET_CLASSIFICATION.label(ASSET_CLASSIFICATION.bankCardZx),
    icon: BankZxIcon,
  },
  {
    value: ASSET_CLASSIFICATION.bankCardGf,
    label: ASSET_CLASSIFICATION.label(ASSET_CLASSIFICATION.bankCardGf),
    icon: BankGfIcon,
  },
  {
    value: ASSET_CLASSIFICATION.bankCardPf,
    label: ASSET_CLASSIFICATION.label(ASSET_CLASSIFICATION.bankCardPf),
    icon: BankPfIcon,
  },
  {
    value: ASSET_CLASSIFICATION.bankCardXy,
    label: ASSET_CLASSIFICATION.label(ASSET_CLASSIFICATION.bankCardXy),
    icon: BankXyIcon,
  },
] as const satisfies readonly AssetClassificationTreeNode[];

const CREDIT_PAY_DETAIL_NODES = [
  {
    value: ASSET_CLASSIFICATION.antCreditPay,
    label: ASSET_CLASSIFICATION.label(ASSET_CLASSIFICATION.antCreditPay),
    icon: AntCreditPayCircleIcon,
  },
  {
    value: ASSET_CLASSIFICATION.jdIous,
    label: ASSET_CLASSIFICATION.label(ASSET_CLASSIFICATION.jdIous),
    icon: JingdongCircleIcon,
  },
  {
    value: ASSET_CLASSIFICATION.douyinMonth,
    label: ASSET_CLASSIFICATION.label(ASSET_CLASSIFICATION.douyinMonth),
    icon: DouyinMonthCircleIcon,
  },
] as const satisfies readonly AssetClassificationTreeNode[];

const ONLINE_WALLET_DETAIL_NODES = [
  {
    value: ASSET_CLASSIFICATION.wechat,
    label: ASSET_CLASSIFICATION.label(ASSET_CLASSIFICATION.wechat),
    icon: WechatCircleIcon,
  },
  {
    value: ASSET_CLASSIFICATION.alipay,
    label: ASSET_CLASSIFICATION.label(ASSET_CLASSIFICATION.alipay),
    icon: AlipayCircleIcon,
  },
  {
    value: ASSET_CLASSIFICATION.douyin,
    label: ASSET_CLASSIFICATION.label(ASSET_CLASSIFICATION.douyin),
    icon: DouyinCircleIcon,
  },
] as const satisfies readonly AssetClassificationTreeNode[];

export const ASSET_CLASSIFICATION_TREE = [
  {
    value: ASSET_TYPE.capitalAccount,
    label: ASSET_TYPE.label(ASSET_TYPE.capitalAccount),
    icon: AssetCircleIcon,
    children: [
      {
        value: ASSET_CLASSIFICATION.cash,
        label: ASSET_CLASSIFICATION.label(ASSET_CLASSIFICATION.cash),
        icon: CashCircleIcon,
      },
      {
        value: ASSET_CLASSIFICATION.debitCard,
        label: ASSET_CLASSIFICATION.label(ASSET_CLASSIFICATION.debitCard),
        icon: BankCardCircleIcon,
        children: BANK_CARD_DETAIL_NODES,
      },
      {
        value: ASSET_CLASSIFICATION.onlineWallet,
        label: ASSET_CLASSIFICATION.label(ASSET_CLASSIFICATION.onlineWallet),
        icon: AssetCircleIcon,
        children: ONLINE_WALLET_DETAIL_NODES,
      },
      {
        value: ASSET_CLASSIFICATION.otherCapital,
        label: ASSET_CLASSIFICATION.label(ASSET_CLASSIFICATION.otherCapital),
        icon: AssetCircleIcon,
      },
    ],
  },
  {
    value: ASSET_TYPE.creditCard,
    label: ASSET_TYPE.label(ASSET_TYPE.creditCard),
    icon: CreditCardCircleIcon,
    children: [
      {
        value: ASSET_CLASSIFICATION.creditCard,
        label: ASSET_CLASSIFICATION.label(ASSET_CLASSIFICATION.creditCard),
        icon: CreditCardCircleIcon,
        children: BANK_CARD_DETAIL_NODES,
      },
      {
        value: ASSET_CLASSIFICATION.creditPay,
        label: ASSET_CLASSIFICATION.label(ASSET_CLASSIFICATION.creditPay),
        icon: AntCreditPayCircleIcon,
        children: CREDIT_PAY_DETAIL_NODES,
      },
      {
        value: ASSET_CLASSIFICATION.otherCreditCard,
        label: ASSET_CLASSIFICATION.label(ASSET_CLASSIFICATION.otherCreditCard),
        icon: CreditCardOtherCircleIcon,
      },
    ],
  },
  {
    value: ASSET_TYPE.storedValueCard,
    label: ASSET_TYPE.label(ASSET_TYPE.storedValueCard),
    icon: RechargeableCardCircleIcon,
    children: [
      {
        value: ASSET_CLASSIFICATION.phoneCharge,
        label: ASSET_CLASSIFICATION.label(ASSET_CLASSIFICATION.phoneCharge),
        icon: PhoneChargeCircleIcon,
      },
      {
        value: ASSET_CLASSIFICATION.busCard,
        label: ASSET_CLASSIFICATION.label(ASSET_CLASSIFICATION.busCard),
        icon: BusCardCircleIcon,
      },
      {
        value: ASSET_CLASSIFICATION.mealCard,
        label: ASSET_CLASSIFICATION.label(ASSET_CLASSIFICATION.mealCard),
        icon: MealCardCircleIcon,
      },
      {
        value: ASSET_CLASSIFICATION.memberCard,
        label: ASSET_CLASSIFICATION.label(ASSET_CLASSIFICATION.memberCard),
        icon: MemberCardCircleIcon,
      },
      {
        value: ASSET_CLASSIFICATION.deposit,
        label: ASSET_CLASSIFICATION.label(ASSET_CLASSIFICATION.deposit),
        icon: DepositCircleIcon,
      },
      {
        value: ASSET_CLASSIFICATION.otherTopUp,
        label: ASSET_CLASSIFICATION.label(ASSET_CLASSIFICATION.otherTopUp),
        icon: RechargeableCardCircleIcon,
      },
    ],
  },
  {
    value: ASSET_TYPE.investment,
    label: ASSET_TYPE.label(ASSET_TYPE.investment),
    icon: FinancialCircleIcon,
    children: [
      {
        value: ASSET_CLASSIFICATION.stock,
        label: ASSET_CLASSIFICATION.label(ASSET_CLASSIFICATION.stock),
        icon: StockCircleIcon,
      },
      {
        value: ASSET_CLASSIFICATION.fund,
        label: ASSET_CLASSIFICATION.label(ASSET_CLASSIFICATION.fund),
        icon: FundCircleIcon,
      },
      {
        value: ASSET_CLASSIFICATION.otherInvestmentFinancial,
        label: ASSET_CLASSIFICATION.label(
          ASSET_CLASSIFICATION.otherInvestmentFinancial,
        ),
        icon: FinancialCircleIcon,
      },
    ],
  },
  {
    value: ASSET_TYPE.debt,
    label: ASSET_TYPE.label(ASSET_TYPE.debt),
    icon: BorrowCircleIcon,
    children: [
      {
        value: ASSET_CLASSIFICATION.borrow,
        label: ASSET_CLASSIFICATION.label(ASSET_CLASSIFICATION.borrow),
        icon: BorrowCircleIcon,
      },
      {
        value: ASSET_CLASSIFICATION.lend,
        label: ASSET_CLASSIFICATION.label(ASSET_CLASSIFICATION.lend),
        icon: LendCircleIcon,
      },
    ],
  },
] as const satisfies readonly AssetClassificationTreeNode[];
