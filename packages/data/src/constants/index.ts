import { enumOf, type EnumOf } from '@pennyspring/share';

export const ASSET_TYPE = enumOf({
  capitalAccount: {
    value: 'capital_account',
    label: '资金账户',
    description: '现金、银行储蓄卡、网络钱包、其它资金',
  },
  creditCard: {
    value: 'credit_card',
    label: '信用卡',
    description: '信用卡、信用付',
  },
  storedValueCard: {
    value: 'stored_value_card',
    label: '储值卡',
    description: '话费卡、公交卡、饭卡、会员卡、押金',
  },
  investment: {
    value: 'investment',
    label: '投资理财',
    description: '股票、基金、其他理财',
  },
  debt: {
    value: 'debt',
    label: '债券债务',
    description: '债务、借入、借出',
  },
});

export const ASSET_CLASSIFICATION = enumOf({
  // 资金账户
  cash: {
    value: 'cash',
    label: '现金',
    description: '现金资产分类',
  },
  debitCard: {
    value: 'debit_card',
    label: '储蓄卡',
    description: '储蓄卡资产分类',
  },
  onlineWallet: {
    value: 'online_wallet',
    label: '网络钱包',
    description: '网络钱包资产分类',
  },
  otherCapital: {
    value: 'other_capital',
    label: '其它资金',
    description: '其它资金资产分类',
  },

  // 信用卡与信用付
  creditCard: {
    value: 'credit_card',
    label: '信用卡',
    description: '信用卡资产分类',
  },
  creditPay: {
    value: 'credit_pay',
    label: '信用付',
    description: '信用付资产分类',
  },
  otherCreditCard: {
    value: 'oth_credit_card',
    label: '其他信用卡',
    description: '其他信用卡资产分类',
  },

  // 银行卡明细
  bankCardZg: {
    value: 'BANK_CARD_ZG',
    label: '中国银行',
    description: '中国银行资产分类明细',
  },
  bankCardZs: {
    value: 'BANK_CARD_ZS',
    label: '招商银行',
    description: '招商银行资产分类明细',
  },
  bankCardGs: {
    value: 'BANK_CARD_GS',
    label: '工商银行',
    description: '工商银行资产分类明细',
  },
  bankCardNy: {
    value: 'BANK_CARD_NY',
    label: '农业银行',
    description: '农业银行资产分类明细',
  },
  bankCardJs: {
    value: 'BANK_CARD_JS',
    label: '建设银行',
    description: '建设银行资产分类明细',
  },
  bankCardJt: {
    value: 'BANK_CARD_JT',
    label: '交通银行',
    description: '交通银行资产分类明细',
  },
  bankCardYz: {
    value: 'BANK_CARD_YZ',
    label: '邮政银行',
    description: '邮政银行资产分类明细',
  },
  bankCardHx: {
    value: 'BANK_CARD_HX',
    label: '华夏银行',
    description: '华夏银行资产分类明细',
  },
  bankCardBj: {
    value: 'BANK_CARD_BJ',
    label: '北京银行',
    description: '北京银行资产分类明细',
  },
  bankCardMs: {
    value: 'BANK_CARD_MS',
    label: '民生银行',
    description: '民生银行资产分类明细',
  },
  bankCardGd: {
    value: 'BANK_CARD_GD',
    label: '光大银行',
    description: '光大银行资产分类明细',
  },
  bankCardZx: {
    value: 'BANK_CARD_ZX',
    label: '中信银行',
    description: '中信银行资产分类明细',
  },
  bankCardGf: {
    value: 'BANK_CARD_GF',
    label: '广发银行',
    description: '广发银行资产分类明细',
  },
  bankCardPf: {
    value: 'BANK_CARD_PF',
    label: '浦发银行',
    description: '浦发银行资产分类明细',
  },
  bankCardXy: {
    value: 'BANK_CARD_XY',
    label: '兴业银行',
    description: '兴业银行资产分类明细',
  },

  // 信用付明细
  antCreditPay: {
    value: 'ANT_CREDIT_PAY',
    label: '花呗',
    description: '花呗资产分类明细',
  },
  jdIous: {
    value: 'JD_IOUS',
    label: '京东白条',
    description: '京东白条资产分类明细',
  },
  douyinMonth: {
    value: 'DOUYIN_MONTH',
    label: '抖音月付',
    description: '抖音月付资产分类明细',
  },

  // 网络钱包明细
  wechat: {
    value: 'WECHAT',
    label: '微信',
    description: '微信资产分类明细',
  },
  alipay: {
    value: 'ALIPAY',
    label: '支付宝',
    description: '支付宝资产分类明细',
  },
  douyin: {
    value: 'DOUYIN',
    label: '抖音',
    description: '抖音资产分类明细',
  },

  // 储值卡与充值卡
  phoneCharge: {
    value: 'PHONE_CHARGE',
    label: '话费',
    description: '话费资产分类',
  },
  busCard: {
    value: 'BUS_CARD',
    label: '公交卡',
    description: '公交卡资产分类',
  },
  mealCard: {
    value: 'MEAL_CARD',
    label: '饭卡',
    description: '饭卡资产分类',
  },
  memberCard: {
    value: 'MEMBER_CARD',
    label: '会员卡',
    description: '会员卡资产分类',
  },
  deposit: {
    value: 'DEPOSIT',
    label: '押金',
    description: '押金资产分类',
  },
  otherTopUp: {
    value: 'OTHER_TOP_UP',
    label: '其它充值卡',
    description: '其它充值卡资产分类',
  },

  // 投资理财
  stock: {
    value: 'STOCK',
    label: '股票',
    description: '股票资产分类',
  },
  fund: {
    value: 'FUND',
    label: '基金',
    description: '基金资产分类',
  },
  otherInvestmentFinancial: {
    value: 'OTHER_INVESTMENT_FINANCIAL',
    label: '其他理财',
    description: '其他理财资产分类',
  },

  // 债权债务
  borrow: {
    value: 'BORROW',
    label: '借入',
    description: '借入资产分类',
  },
  lend: {
    value: 'LEND',
    label: '借出',
    description: '借出资产分类',
  },
});

export const VISIBILITY = enumOf({
  visible: {
    value: 'visible',
    label: '显示',
    description: '在默认列表中显示',
  },
  hidden: {
    value: 'hidden',
    label: '隐藏',
    description: '不在默认列表中显示',
  },
});

export const SYSTEM_STATUS = enumOf({
  custom: {
    value: 'custom',
    label: '自定义',
    description: '用户自定义数据',
  },
  system: {
    value: 'system',
    label: '系统内置',
    description: '系统内置数据',
  },
});

export const RECORD_TYPE_CATEGORY = enumOf({
  expense: {
    value: 'expense',
    label: '支出',
    description: '支出记录类型',
  },
  income: {
    value: 'income',
    label: '收入',
    description: '收入记录类型',
  },
  transfer: {
    value: 'transfer',
    label: '转账',
    description: '转账记录类型',
  },
});

export const RECORD_TYPE_SPECIAL_BEHAVIOR = enumOf({
  none: {
    value: '',
    label: '无',
    description: '普通分类，无特殊行为',
  },
  refundAbsorption: {
    value: 'refund_absorption',
    label: '退款吸收',
    description: '退款收入必须关联普通支出，并按吸收规则抵扣支出统计',
  },
  reimbursementAbsorption: {
    value: 'reimbursement_absorption',
    label: '报销吸收',
    description: '报销收入必须关联可报销支出，并按吸收规则抵扣支出统计',
  },
  creditCardPayment: {
    value: 'credit_card_payment',
    label: '还信用卡',
    description: '转入资产必须是信用卡/信用付资产，并减少待还金额',
  },
  debtBorrow: {
    value: 'debt_borrow',
    label: '债务借入',
    description: '资金账户增加，借入债务余额增加',
  },
  debtLend: {
    value: 'debt_lend',
    label: '债权借出',
    description: '资金账户减少，借出债权余额增加',
  },
  debtRepayment: {
    value: 'debt_repayment',
    label: '债务还款',
    description: '资金账户减少，借入债务余额减少',
  },
  debtProceeds: {
    value: 'debt_proceeds',
    label: '债权收款',
    description: '资金账户增加，借出债权余额减少',
  },
});

export const REIMBURSABLE = enumOf({
  notReimbursable: {
    value: 'none',
    label: '不可报销',
    description: '记录不可报销',
  },
  reimbursable: {
    value: 'able',
    label: '可报销',
    description: '记录可报销',
  },
});

export const BOOK_TYPE = enumOf({
  local: {
    value: 'local',
    label: '本地账本',
    description: '数据存储在本地设备',
  },
  remote: {
    value: 'remote',
    label: '远程账本',
    description: '数据存储在远程服务器',
  },
});

export type AssetTypeValue = EnumOf<typeof ASSET_TYPE>;
export type AssetClassificationValue = EnumOf<typeof ASSET_CLASSIFICATION>;
export type IconValue = string;
export type VisibilityValue = EnumOf<typeof VISIBILITY>;
export type SystemStatusValue = EnumOf<typeof SYSTEM_STATUS>;
export type RecordTypeCategoryValue = EnumOf<typeof RECORD_TYPE_CATEGORY>;
export type RecordTypeSpecialBehaviorValue = EnumOf<typeof RECORD_TYPE_SPECIAL_BEHAVIOR>;
export type ReimbursableValue = EnumOf<typeof REIMBURSABLE>;
export type BookTypeValue = EnumOf<typeof BOOK_TYPE>;
