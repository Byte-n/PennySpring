import { enumOf } from '@pennyspring/share';

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

export const ICON = enumOf({
  // 收入 (Income)
  salary: { value: 'salary', label: '薪资' },
  bonus: { value: 'bonus', label: '奖金' },
  royalty: { value: 'royalty', label: '提成' },
  refund: { value: 'refund', label: '退款' },
  reimburse: { value: 'reimburse', label: '报销' },
  investment: { value: 'investment', label: '投资' },
  providentFund: { value: 'provident_fund', label: '公积金' },
  medicare: { value: 'medicare', label: '医保' },
  alimony: { value: 'alimony', label: '生活费' },
  pocketMoney: { value: 'pocket_money', label: '零花钱' },
  luckyMoney: { value: 'lucky_money', label: '压岁钱' },
  convertPayment: { value: 'convert_payment', label: '红包' },
  windfall: { value: 'windfall', label: '外快' },
  rent: { value: 'rent', label: '租金' },
  taxRebate: { value: 'tax_rebate', label: '退税' },
  dividend: { value: 'dividend', label: '分红' },
  scholarship: { value: 'scholarship', label: '奖学金' },
  benefit: { value: 'benefit', label: '津贴' },

  // 转账 (Transfer)
  accountTransfer: { value: 'account_transfer', label: '账户互转' },
  creditCardPayment: { value: 'credit_card_payment', label: '还信用卡' },
  withdrawals: { value: 'withdrawals', label: '取款' },
  deposit: { value: 'deposit', label: '存款' },
  borrow: { value: 'borrow', label: '借入' },
  lend: { value: 'lend', label: '借出' },
  repayment: { value: 'repayment', label: '还款' },
  proceeds: { value: 'proceeds', label: '收款' },

  // 理财 (Money Management)
  stock: { value: 'stock', label: '股票' },
  fund: { value: 'fund', label: '基金' },
  moneyManagement: { value: 'money_management', label: '理财' },
  gold: { value: 'gold', label: '黄金' },
  bond: { value: 'bond', label: '债券' },
  forex: { value: 'forex', label: '外汇' },
  charge: { value: 'charge', label: '手续费' },

  // 餐饮 (Dining)
  dining: { value: 'dining', label: '餐饮' },
  threeMeals: { value: 'three_meals', label: '三餐' },
  breakfast: { value: 'breakfast', label: '早餐' },
  lunch: { value: 'lunch', label: '午餐' },
  dinner: { value: 'dinner', label: '晚餐' },
  supper: { value: 'supper', label: '夜宵' },
  takeaway: { value: 'takeaway', label: '外卖' },
  foodIngredient: { value: 'food_ingredient', label: '食材' },
  fruit: { value: 'fruit', label: '水果' },
  dessert: { value: 'dessert', label: '甜点' },
  snacks: { value: 'snacks', label: '零食' },
  drinks: { value: 'drinks', label: '饮料' },
  at: { value: 'at', label: '烟酒' },
  ats: { value: 'ats', label: '烟酒零食' },

  // 日常 (Daily)
  dailyNecessities: { value: 'daily_necessities', label: '日用' },
  kitchenDailyNecessities: { value: 'kitchen_daily_necessities', label: '柴米油盐' },
  communication: { value: 'communication', label: '通讯' },
  callCharge: { value: 'call_charge', label: '话费' },
  netFee: { value: 'net_fee', label: '网费' },
  life: { value: 'life', label: '生活' },
  clean: { value: 'clean', label: '清洁' },
  haircut: { value: 'haircut', label: '理发' },
  bath: { value: 'bath', label: '洗澡' },
  express: { value: 'express', label: '快递' },

  // 购物 (Shopping)
  shopping: { value: 'shopping', label: '购物' },
  digitalProduct: { value: 'digital_product', label: '数码' },
  daily: { value: 'daily', label: '日常' },
  electricalAppliance: { value: 'electrical_appliance', label: '电器' },
  clothes: { value: 'clothes', label: '鞋服' },
  furniture: { value: 'furniture', label: '家具' },
  beauty: { value: 'beauty', label: '美妆' },
  bodyHair: { value: 'body_hair', label: '洗护' },
  souvenir: { value: 'souvenir', label: '纪念品' },

  // 服饰 (Dress)
  hat: { value: 'hat', label: '帽子' },
  coat: { value: 'coat', label: '外套' },
  pants: { value: 'pants', label: '裤子' },
  underwear: { value: 'underwear', label: '内衣' },
  bag: { value: 'bag', label: '包包' },
  shoes: { value: 'shoes', label: '鞋子' },
  socks: { value: 'socks', label: '袜子' },
  accessories: { value: 'accessories', label: '饰品' },

  // 数码 (Digital)
  mobilePhone: { value: 'mobile_phone', label: '手机' },
  mobilePhoneAccessories: { value: 'mobile_phone_accessories', label: '手机配件' },
  member: { value: 'member', label: '付费会员' },
  camera: { value: 'camera', label: '相机' },

  // 娱乐 (Entertainment)
  amusement: { value: 'amusement', label: '娱乐' },
  game: { value: 'game', label: '游戏' },
  party: { value: 'party', label: '聚会' },
  movie: { value: 'movie', label: '电影' },
  sing: { value: 'sing', label: 'K歌' },
  show: { value: 'show', label: '演出' },
  travel: { value: 'travel', label: '旅行' },
  tickets: { value: 'tickets', label: '门票' },
  excursionFare: { value: 'excursion_fare', label: '团费' },
  sport: { value: 'sport', label: '运动' },

  // 家庭 (Family)
  family: { value: 'family', label: '家人' },
  parent: { value: 'parent', label: '父母' },
  love: { value: 'love', label: '恋爱' },
  child: { value: 'child', label: '孩子' },
  pet: { value: 'pet', label: '宠物' },

  // 育儿 (Parenting)
  parenting: { value: 'parenting', label: '育儿' },
  milkPowder: { value: 'milk_powder', label: '奶粉' },
  feeder: { value: 'feeder', label: '奶瓶' },
  supplementaryFood: { value: 'supplementary_food', label: '辅食' },
  diapers: { value: 'diapers', label: '纸尿裤' },
  kids: { value: 'kids', label: '童装' },
  toy: { value: 'toy', label: '玩具' },
  earlyEducation: { value: 'early_education', label: '早教' },
  familyTrip: { value: 'family_trip', label: '亲子游' },
  vaccination: { value: 'vaccination', label: '疫苗接种' },

  // 汽车 (Car)
  car: { value: 'car', label: '汽车' },
  refuel: { value: 'refuel', label: '加油' },
  carCharge: { value: 'car_charge', label: '充电' },
  parking: { value: 'parking', label: '停车' },
  toll: { value: 'toll', label: '通行费' },
  autoParts: { value: 'auto_parts', label: '汽车配件' },
  repair: { value: 'repair', label: '维修' },
  carMaintenance: { value: 'car_maintenance', label: '保养' },
  carWash: { value: 'car_wash', label: '洗车' },
  illegal: { value: 'illegal', label: '违章' },
  carInsurance: { value: 'car_insurance', label: '车险' },
  carInspection: { value: 'car_inspection', label: '车检' },
  carLoan: { value: 'car_loan', label: '车贷' },

  // 人情 (Interpersonal)
  interpersonal: { value: 'interpersonal', label: '人际关系' },
  cashGift: { value: 'cash_gift', label: '礼金' },
  gift: { value: 'gift', label: '礼品' },
  treat: { value: 'treat', label: '请客' },

  // 交通 (Traffic)
  traffic: { value: 'traffic', label: '交通' },
  bus: { value: 'bus', label: '公交' },
  subway: { value: 'subway', label: '地铁' },
  train: { value: 'train', label: '火车' },
  plane: { value: 'plane', label: '飞机' },
  taxi: { value: 'taxi', label: '打车' },
  ship: { value: 'ship', label: '轮船' },
  bicycle: { value: 'bicycle', label: '自行车' },

  // 住房 (Housing)
  housing: { value: 'housing', label: '住房' },
  houseRent: { value: 'house_rent', label: '房租' },
  houseLoan: { value: 'house_loan', label: '房贷' },
  hotel: { value: 'hotel', label: '酒店' },

  // 医疗 (Medical)
  medical: { value: 'medical', label: '医疗' },
  medkit: { value: 'medkit', label: '医疗包' },
  registration: { value: 'registration', label: '挂号' },
  diagnose: { value: 'diagnose', label: '看诊' },
  drug: { value: 'drug', label: '药品' },
  hospitalization: { value: 'hospitalization', label: '住院' },
  hygiene: { value: 'hygiene', label: '保健' },

  // 校园 (Campus)
  booksEducation: { value: 'books_education', label: '文教' },
  study: { value: 'study', label: '学费' },
  stationery: { value: 'stationery', label: '文具' },
  exam: { value: 'exam', label: '考试' },
  books: { value: 'books', label: '书籍' },
  training: { value: 'training', label: '培训' },

  // 物业 (Tenement)
  waterRate: { value: 'water_rate', label: '水费' },
  electricity: { value: 'electricity', label: '电费' },
  gasCharge: { value: 'gas_charge', label: '燃气费' },
  garbageFee: { value: 'garbage_fee', label: '垃圾费' },
  propertyCosts: { value: 'property_costs', label: '物业费' },
  heatingFee: { value: 'heating_fee', label: '取暖费' },

  // 其它 (Other)
  other: { value: 'other', label: '其它' },
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

export const REIMBURSABLE = enumOf({
  notReimbursable: {
    value: 'not_reimbursable',
    label: '不可报销',
    description: '记录不可报销',
  },
  reimbursable: {
    value: 'reimbursable',
    label: '可报销',
    description: '记录可报销',
  },
});
