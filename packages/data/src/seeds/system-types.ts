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
      { name: '三餐', icon: 'BowlFood', sort: 1 },
      { name: '夜宵', icon: 'MoonStars', sort: 2 },
      { name: '柴米油盐', icon: 'CookingPot', sort: 3 },
      { name: '食材', icon: 'Carrot', sort: 4 },
    ],
  },
  {
    name: '烟酒零食',
    icon: 'Cookie',
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    sort: 2,
    children: [
      { name: '水果', icon: 'OrangeSlice', sort: 1 },
      { name: '甜点', icon: 'Cake', sort: 2 },
      { name: '零食', icon: 'Cookie', sort: 3 },
      { name: '饮料', icon: 'Coffee', sort: 4 },
      { name: '烟酒', icon: 'Cigarette', sort: 5 },
      { name: '小吃', icon: 'Storefront', sort: 6 },
    ],
  },
  {
    name: '购物',
    icon: 'ShoppingCart',
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    sort: 3,
    children: [
      { name: '数码', icon: 'DeviceMobile', sort: 1 },
      { name: '日用', icon: 'Basket', sort: 2 },
      { name: '电器', icon: 'Plug', sort: 3 },
      { name: '美妆', icon: 'Sparkle', sort: 4 },
      { name: '鞋服', icon: 'TShirt', sort: 5 },
      { name: '首饰', icon: 'Watch', sort: 6 },
    ],
  },
  {
    name: '文教',
    icon: 'GraduationCap',
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    sort: 4,
    children: [
      { name: '学费', icon: 'BookOpen', sort: 1 },
      { name: '文具', icon: 'PencilRuler', sort: 2 },
      { name: '考试', icon: 'Exam', sort: 3 },
      { name: '培训', icon: 'Chalkboard', sort: 4 },
      { name: '书籍', icon: 'Books', sort: 5 },
    ],
  },
  {
    name: '人际关系',
    icon: 'Handshake',
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    sort: 5,
    children: [
      { name: '礼金', icon: 'MoneyWavy', sort: 1 },
      { name: '礼品', icon: 'Gift', sort: 2 },
      { name: '请客', icon: 'ForkKnife', sort: 3 },
    ],
  },
  {
    name: '交通',
    icon: 'TrafficSignal',
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    sort: 6,
    children: [
      { name: '公交', icon: 'Bus', sort: 1 },
      { name: '地铁', icon: 'Subway', sort: 2 },
      { name: '打车', icon: 'Taxi', sort: 3 },
      { name: '火车', icon: 'Train', sort: 4 },
      { name: '飞机', icon: 'AirplaneTilt', sort: 5 },
      { name: '共享车', icon: 'Bicycle', sort: 6 },
    ],
  },
  {
    name: '娱乐',
    icon: 'GameController',
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    sort: 7,
    children: [
      { name: '游戏', icon: 'Joystick', sort: 1 },
      { name: '聚会', icon: 'Confetti', sort: 2 },
      { name: '宠物', icon: 'PawPrint', sort: 3 },
      { name: 'K歌', icon: 'MusicNotes', sort: 4 },
      { name: '电影', icon: 'FilmSlate', sort: 5 },
      { name: '演出', icon: 'Megaphone', sort: 6 },
      { name: '会员', icon: 'CrownSimple', sort: 7 },
    ],
  },
  {
    name: '生活',
    icon: 'Heart',
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    sort: 8,
    children: [
      { name: '水费', icon: 'Drop', sort: 1 },
      { name: '电费', icon: 'Lightning', sort: 2 },
      { name: '燃气费', icon: 'Flame', sort: 3 },
      { name: '垃圾费', icon: 'Recycle', sort: 4 },
      { name: '物业费', icon: 'Building', sort: 5 },
      { name: '取暖费', icon: 'ThermometerHot', sort: 6 },
    ],
  },
  {
    name: '汽车',
    icon: 'Car',
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    sort: 9,
    children: [
      { name: '停车', icon: 'Garage', sort: 1 },
      { name: '加油', icon: 'GasPump', sort: 2 },
      { name: '充电', icon: 'BatteryCharging', sort: 3 },
      { name: '通行费', icon: 'RoadHorizon', sort: 4 },
      { name: '保养', icon: 'Wrench', sort: 5 },
      { name: '洗车', icon: 'SprayBottle', sort: 6 },
      { name: '维修', icon: 'Hammer', sort: 7 },
      { name: '违章', icon: 'WarningCircle', sort: 8 },
      { name: '车险', icon: 'ShieldCheck', sort: 9 },
      { name: '车检', icon: 'ClipboardText', sort: 10 },
      { name: '车贷', icon: 'Bank', sort: 11 },
    ],
  },
  {
    name: '医疗',
    icon: 'Hospital',
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    sort: 10,
    children: [
      { name: '挂号', icon: 'ClipboardText', sort: 1 },
      { name: '看诊', icon: 'Stethoscope', sort: 2 },
      { name: '药品', icon: 'Pill', sort: 3 },
      { name: '住院', icon: 'Bed', sort: 4 },
      { name: '保健', icon: 'Heartbeat', sort: 5 },
    ],
  },
  {
    name: '通讯',
    icon: 'Phone',
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    sort: 11,
    children: [
      { name: '话费', icon: 'Phone', sort: 1 },
      { name: '网费', icon: 'WifiHigh', sort: 2 },
    ],
  },
  {
    name: '育儿',
    icon: 'BabyCarriage',
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    sort: 12,
    children: [
      { name: '奶粉', icon: 'BowlFood', sort: 1 },
      { name: '辅食', icon: 'CookingPot', sort: 2 },
      { name: '洗护', icon: 'SprayBottle', sort: 3 },
      { name: '玩具', icon: 'PuzzlePiece', sort: 4 },
      { name: '童装', icon: 'TShirt', sort: 5 },
    ],
  },
  {
    name: '旅行',
    icon: 'Airplane',
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    sort: 13,
    children: [
      { name: '团费', icon: 'MoneyWavy', sort: 1 },
      { name: '门票', icon: 'Ticket', sort: 2 },
      { name: '纪念品', icon: 'Gift', sort: 3 },
      { name: '酒店', icon: 'Bed', sort: 4 },
    ],
  },
  {
    name: '住房',
    icon: 'House',
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    sort: 14,
    children: [
      { name: '房租', icon: 'Key', sort: 1 },
      { name: '房贷', icon: 'Bank', sort: 2 },
      { name: '搬家', icon: 'Package', sort: 3 },
      { name: '维修', icon: 'Hammer', sort: 4 },
    ],
  },
  {
    name: '赡养',
    icon: 'Users',
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    sort: 15,
  },
  {
    name: '其他',
    icon: 'DotsThreeCircle',
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    sort: 16,
  },

  // ── 收入类型 ──────────────────────────────────────────────
  {
    name: '收红包',
    icon: 'CurrencyCny',
    typeCategory: RECORD_TYPE_CATEGORY.income,
    sort: 100,
  },
  {
    name: '薪资',
    icon: 'Briefcase',
    typeCategory: RECORD_TYPE_CATEGORY.income,
    sort: 101,
  },
  {
    name: '奖金',
    icon: 'Coin',
    typeCategory: RECORD_TYPE_CATEGORY.income,
    sort: 102,
  },
  {
    name: '退还',
    icon: 'ArrowULeftDown',
    typeCategory: RECORD_TYPE_CATEGORY.income,
    sort: 103,
    specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.refundAbsorption,
  },
  {
    name: '报销',
    icon: 'Receipt',
    typeCategory: RECORD_TYPE_CATEGORY.income,
    sort: 104,
    specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.reimbursementAbsorption,
  },
  {
    name: '投资',
    icon: 'ChartLineUp',
    typeCategory: RECORD_TYPE_CATEGORY.income,
    sort: 105,
  },
  {
    name: '外快',
    icon: 'ShootingStar',
    typeCategory: RECORD_TYPE_CATEGORY.income,
    sort: 106,
  },
  {
    name: '其他',
    icon: 'DotsThreeCircle',
    typeCategory: RECORD_TYPE_CATEGORY.income,
    sort: 107,
  },

  // ── 转账类型 ──────────────────────────────────────────────
  {
    name: '帐户互转',
    icon: 'ArrowsLeftRight',
    typeCategory: RECORD_TYPE_CATEGORY.transfer,
    sort: 200,
  },
  {
    name: '还信用卡',
    icon: 'CreditCard',
    typeCategory: RECORD_TYPE_CATEGORY.transfer,
    sort: 201,
    specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.creditCardPayment,
  },
  {
    name: '取款',
    icon: 'ArrowLineUp',
    typeCategory: RECORD_TYPE_CATEGORY.transfer,
    sort: 202,
  },
  {
    name: '存款',
    icon: 'ArrowLineDown',
    typeCategory: RECORD_TYPE_CATEGORY.transfer,
    sort: 203,
  },
  {
    name: '借入',
    icon: 'HandWithdraw',
    typeCategory: RECORD_TYPE_CATEGORY.transfer,
    sort: 204,
    specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.debtBorrow,
  },
  {
    name: '借出',
    icon: 'HandDeposit',
    typeCategory: RECORD_TYPE_CATEGORY.transfer,
    sort: 205,
    specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.debtLend,
  },
  {
    name: '还款',
    icon: 'ArrowULeftDown',
    typeCategory: RECORD_TYPE_CATEGORY.transfer,
    sort: 206,
    specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.debtRepayment,
  },
  {
    name: '收款',
    icon: 'Coins',
    typeCategory: RECORD_TYPE_CATEGORY.transfer,
    sort: 207,
    specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.debtProceeds,
  },
  {
    name: '其他',
    icon: 'DotsThreeCircle',
    typeCategory: RECORD_TYPE_CATEGORY.transfer,
    sort: 208,
  },
]
