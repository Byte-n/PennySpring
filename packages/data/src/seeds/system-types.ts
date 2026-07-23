import type {
  RecordTypeCategoryValue,
  RecordTypeSpecialBehaviorValue,
} from '../constants'
import {
  RECORD_TYPE_CATEGORY,
  RECORD_TYPE_SPECIAL_BEHAVIOR,
} from '../constants'

/**
 * 二级类型种子节点。typeCategory 继承自父节点，无需重复声明。
 */
export interface SystemTypeSeedChild {
  name: string
  icon: string
  sort: number
  specialBehavior?: RecordTypeSpecialBehaviorValue
}

/**
 * 一级类型种子节点，可携带二级子类型。
 */
export interface SystemTypeSeedNode {
  name: string
  icon: string
  typeCategory: RecordTypeCategoryValue
  sort: number
  specialBehavior?: RecordTypeSpecialBehaviorValue
  children?: SystemTypeSeedChild[]
}

/**
 * 系统默认类型种子数据。
 *
 * 作为类型数据的唯一事实来源（single source of truth）：
 * - 迁移后默认账本通过 {@link ensureDefaultBookSeeded} 写入
 * - 新建账本时通过 {@link seedSystemTypesForBook} 写入
 *
 * 数据与旧迁移脚本 `0000_nervous_silvermane.sql` 中的 INSERT 保持一致，
 * 并修正了 `special_behavior` 值以匹配 {@link RECORD_TYPE_SPECIAL_BEHAVIOR} 常量。
 */
export const SYSTEM_TYPE_SEEDS: SystemTypeSeedNode[] = [
  // ── 支出类型 ──────────────────────────────────────────────
  {
    name: '餐饮',
    icon: 'ForkKnife',
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    sort: 1,
    children: [
      { name: '餐饮', icon: 'ForkKnife', sort: 1 },
      { name: '三餐', icon: 'BowlFood', sort: 2 },
      { name: '早餐', icon: 'Sun', sort: 3 },
      { name: '午餐', icon: 'CookingPot', sort: 4 },
      { name: '晚餐', icon: 'BowlSteam', sort: 5 },
      { name: '夜宵', icon: 'MoonStars', sort: 6 },
      { name: '外卖', icon: 'Package', sort: 7 },
      { name: '食材', icon: 'Carrot', sort: 8 },
      { name: '柴米油盐', icon: 'CookingPot', sort: 9 },
      { name: '水果', icon: 'OrangeSlice', sort: 10 },
      { name: '甜点', icon: 'Cake', sort: 11 },
      { name: '零食', icon: 'Cookie', sort: 12 },
      { name: '饮料', icon: 'Coffee', sort: 13 },
      { name: '烟酒', icon: 'Cigarette', sort: 14 },
      { name: '烟酒零食', icon: 'Storefront', sort: 15 },
    ],
  },
  {
    name: '日常',
    icon: 'Heart',
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    sort: 2,
    children: [
      { name: '日用', icon: 'Basket', sort: 1 },
      { name: '柴米油盐', icon: 'CookingPot', sort: 2 },
      { name: '通讯', icon: 'ChatCircle', sort: 3 },
      { name: '话费', icon: 'Phone', sort: 4 },
      { name: '网费', icon: 'WifiHigh', sort: 5 },
      { name: '生活', icon: 'Heart', sort: 6 },
      { name: '清洁', icon: 'Broom', sort: 7 },
      { name: '理发', icon: 'Scissors', sort: 8 },
      { name: '洗澡', icon: 'Shower', sort: 9 },
      { name: '快递', icon: 'Package', sort: 10 },
      { name: '水费', icon: 'Drop', sort: 11 },
      { name: '电费', icon: 'Lightning', sort: 12 },
      { name: '燃气费', icon: 'Flame', sort: 13 },
      { name: '垃圾费', icon: 'Recycle', sort: 14 },
      { name: '物业费', icon: 'Building', sort: 15 },
      { name: '取暖费', icon: 'ThermometerHot', sort: 16 },
    ],
  },
  {
    name: '购物',
    icon: 'ShoppingCart',
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    sort: 3,
    children: [
      { name: '购物', icon: 'ShoppingCart', sort: 1 },
      { name: '数码', icon: 'DeviceMobile', sort: 2 },
      { name: '日用', icon: 'Basket', sort: 3 },
      { name: '电器', icon: 'Plug', sort: 4 },
      { name: '美妆', icon: 'Sparkle', sort: 5 },
      { name: '鞋服', icon: 'TShirt', sort: 6 },
      { name: '饰品', icon: 'Watch', sort: 7 },
      { name: '家具', icon: 'Armchair', sort: 8 },
    ],
  },
  {
    name: '服饰',
    icon: 'TShirt',
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    sort: 4,
    children: [
      { name: '帽子', icon: 'BaseballCap', sort: 1 },
      { name: '外套', icon: 'Hoodie', sort: 2 },
      { name: '裤子', icon: 'Pants', sort: 3 },
      { name: '内衣', icon: 'TShirt', sort: 4 },
      { name: '包包', icon: 'Handbag', sort: 5 },
      { name: '鞋子', icon: 'Sneaker', sort: 6 },
      { name: '袜子', icon: 'Sock', sort: 7 },
      { name: '饰品', icon: 'Watch', sort: 8 },
    ],
  },
  {
    name: '数码',
    icon: 'DeviceMobile',
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    sort: 5,
    children: [
      { name: '手机', icon: 'DeviceMobile', sort: 1 },
      { name: '手机配件', icon: 'Headphones', sort: 2 },
      { name: '付费会员', icon: 'CrownSimple', sort: 3 },
      { name: '相机', icon: 'Camera', sort: 4 },
    ],
  },
  {
    name: '娱乐',
    icon: 'GameController',
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    sort: 6,
    children: [
      { name: '娱乐', icon: 'GameController', sort: 1 },
      { name: '游戏', icon: 'Joystick', sort: 2 },
      { name: '聚会', icon: 'Confetti', sort: 3 },
      { name: '宠物', icon: 'PawPrint', sort: 4 },
      { name: 'K歌', icon: 'MusicNotes', sort: 5 },
      { name: '电影', icon: 'FilmSlate', sort: 6 },
      { name: '演出', icon: 'Megaphone', sort: 7 },
      { name: '旅行', icon: 'Airplane', sort: 8 },
      { name: '门票', icon: 'Ticket', sort: 9 },
      { name: '团费', icon: 'MoneyWavy', sort: 10 },
      { name: '酒店', icon: 'Bed', sort: 11 },
      { name: '纪念品', icon: 'Gift', sort: 12 },
      { name: '运动', icon: 'PersonSimpleRun', sort: 13 },
    ],
  },
  {
    name: '家庭',
    icon: 'Users',
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    sort: 7,
    children: [
      { name: '家人', icon: 'Users', sort: 1 },
      { name: '父母', icon: 'User', sort: 2 },
      { name: '恋爱', icon: 'Heart', sort: 3 },
      { name: '孩子', icon: 'Baby', sort: 4 },
      { name: '宠物', icon: 'PawPrint', sort: 5 },
    ],
  },
  {
    name: '育儿',
    icon: 'BabyCarriage',
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    sort: 8,
    children: [
      { name: '育儿', icon: 'BabyCarriage', sort: 1 },
      { name: '奶粉', icon: 'BowlFood', sort: 2 },
      { name: '奶瓶', icon: 'Jar', sort: 3 },
      { name: '辅食', icon: 'CookingPot', sort: 4 },
      { name: '纸尿裤', icon: 'Pants', sort: 5 },
      { name: '洗护', icon: 'SprayBottle', sort: 6 },
      { name: '玩具', icon: 'PuzzlePiece', sort: 7 },
      { name: '童装', icon: 'TShirt', sort: 8 },
      { name: '早教', icon: 'BookOpen', sort: 9 },
      { name: '亲子游', icon: 'Airplane', sort: 10 },
      { name: '疫苗接种', icon: 'Syringe', sort: 11 },
    ],
  },
  {
    name: '汽车',
    icon: 'Car',
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    sort: 9,
    children: [
      { name: '汽车', icon: 'Car', sort: 1 },
      { name: '停车', icon: 'Garage', sort: 2 },
      { name: '加油', icon: 'GasPump', sort: 3 },
      { name: '充电', icon: 'BatteryCharging', sort: 4 },
      { name: '保养', icon: 'Wrench', sort: 5 },
      { name: '洗车', icon: 'SprayBottle', sort: 6 },
      { name: '维修', icon: 'Hammer', sort: 7 },
      { name: '违章', icon: 'WarningCircle', sort: 8 },
      { name: '车险', icon: 'ShieldCheck', sort: 9 },
      { name: '车检', icon: 'ClipboardText', sort: 10 },
      { name: '车贷', icon: 'Bank', sort: 11 },
      { name: '通行费', icon: 'RoadHorizon', sort: 12 },
      { name: '汽车配件', icon: 'Gear', sort: 13 },
    ],
  },
  {
    name: '人际关系',
    icon: 'Handshake',
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    sort: 10,
    children: [
      { name: '人际关系', icon: 'Handshake', sort: 1 },
      { name: '礼金', icon: 'MoneyWavy', sort: 2 },
      { name: '礼品', icon: 'Gift', sort: 3 },
      { name: '请客', icon: 'ForkKnife', sort: 4 },
    ],
  },
  {
    name: '交通',
    icon: 'TrafficSignal',
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    sort: 11,
    children: [
      { name: '交通', icon: 'TrafficSignal', sort: 1 },
      { name: '公交', icon: 'Bus', sort: 2 },
      { name: '地铁', icon: 'Subway', sort: 3 },
      { name: '打车', icon: 'Taxi', sort: 4 },
      { name: '火车', icon: 'Train', sort: 5 },
      { name: '飞机', icon: 'AirplaneTilt', sort: 6 },
      { name: '轮船', icon: 'Boat', sort: 7 },
      { name: '自行车', icon: 'Bicycle', sort: 8 },
    ],
  },
  {
    name: '住房',
    icon: 'House',
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    sort: 12,
    children: [
      { name: '住房', icon: 'House', sort: 1 },
      { name: '房租', icon: 'Key', sort: 2 },
      { name: '房贷', icon: 'Bank', sort: 3 },
    ],
  },
  {
    name: '医疗',
    icon: 'Hospital',
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    sort: 13,
    children: [
      { name: '医疗', icon: 'Hospital', sort: 1 },
      { name: '挂号', icon: 'ClipboardText', sort: 2 },
      { name: '看诊', icon: 'Stethoscope', sort: 3 },
      { name: '药品', icon: 'Pill', sort: 4 },
      { name: '住院', icon: 'Bed', sort: 5 },
      { name: '保健', icon: 'Heartbeat', sort: 6 },
    ],
  },
  {
    name: '文教',
    icon: 'GraduationCap',
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    sort: 14,
    children: [
      { name: '文教', icon: 'GraduationCap', sort: 1 },
      { name: '学费', icon: 'BookOpen', sort: 2 },
      { name: '文具', icon: 'PencilRuler', sort: 3 },
      { name: '考试', icon: 'Exam', sort: 4 },
      { name: '培训', icon: 'Chalkboard', sort: 5 },
      { name: '书籍', icon: 'Books', sort: 6 },
    ],
  },
  {
    name: '物业',
    icon: 'Building',
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    sort: 15,
  },
  {
    name: '其它',
    icon: 'DotsThreeCircle',
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    sort: 16,
    children: [
      { name: '其它', icon: 'DotsThreeCircle', sort: 1 },
    ],
  },

  // ── 收入类型 ──────────────────────────────────────────────
  {
    name: '收入',
    icon: 'Briefcase',
    typeCategory: RECORD_TYPE_CATEGORY.income,
    sort: 100,
    children: [
      { name: '报销', icon: 'Receipt', sort: 1, specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.reimbursementAbsorption },
      { name: '退款', icon: 'ArrowULeftDown', sort: 2, specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.refundAbsorption },
      { name: '薪资', icon: 'Briefcase', sort: 3 },
      { name: '奖金', icon: 'Coin', sort: 4 },
      { name: '投资', icon: 'ChartLineUp', sort: 5 },
      { name: '外快', icon: 'ShootingStar', sort: 6 },
      { name: '其它', icon: 'DotsThreeCircle', sort: 7 },
      { name: '提成', icon: 'Crown', sort: 8 },
      { name: '公积金', icon: 'Bank', sort: 9 },
      { name: '医保', icon: 'FirstAidKit', sort: 10 },
      { name: '生活费', icon: 'HandHeart', sort: 11 },
      { name: '零花钱', icon: 'Wallet', sort: 12 },
      { name: '压岁钱', icon: 'HandCoins', sort: 13 },
      { name: '红包', icon: 'CurrencyCny', sort: 14 },
      { name: '租金', icon: 'House', sort: 15 },
      { name: '退税', icon: 'ReceiptX', sort: 16 },
      { name: '分红', icon: 'ChartPieSlice', sort: 17 },
      { name: '奖学金', icon: 'GraduationCap', sort: 18 },
      { name: '津贴', icon: 'Gift', sort: 19 },
    ],
  },

  // ── 转账类型 ──────────────────────────────────────────────
  {
    name: '转账',
    icon: 'ArrowsLeftRight',
    typeCategory: RECORD_TYPE_CATEGORY.transfer,
    sort: 200,
    children: [
      { name: '账户互转', icon: 'ArrowsLeftRight', sort: 1 },
      { name: '还信用卡', icon: 'CreditCard', sort: 2, specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.creditCardPayment },
      { name: '取款', icon: 'ArrowLineUp', sort: 3 },
      { name: '存款', icon: 'ArrowLineDown', sort: 4 },
      { name: '借入', icon: 'HandWithdraw', sort: 5, specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.debtBorrow },
      { name: '借出', icon: 'HandDeposit', sort: 6, specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.debtLend },
      { name: '还款', icon: 'ArrowULeftDown', sort: 7, specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.debtRepayment },
      { name: '收款', icon: 'Coins', sort: 8, specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.debtProceeds },
      { name: '其他', icon: 'DotsThreeCircle', sort: 9 },
    ],
  },

  // ── 理财类型（typeCategory 与转账相同） ───────────────────
  {
    name: '理财',
    icon: 'PiggyBank',
    typeCategory: RECORD_TYPE_CATEGORY.transfer,
    sort: 300,
    children: [
      { name: '股票', icon: 'ChartLineUp', sort: 1 },
      { name: '基金', icon: 'ChartBar', sort: 2 },
      { name: '理财', icon: 'PiggyBank', sort: 3 },
      { name: '黄金', icon: 'CoinVertical', sort: 4 },
      { name: '债券', icon: 'Certificate', sort: 5 },
      { name: '外汇', icon: 'CurrencyCircleDollar', sort: 6 },
      { name: '手续费', icon: 'Receipt', sort: 7 },
    ],
  },
]
