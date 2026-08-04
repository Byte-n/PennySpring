import type { RecordTypeCategoryValue } from '@pennyspring/api';

/**
 * 快捷记账模板。按账本分组持久化在全局状态中（不入库）。
 * 金额单位为「分」，与数据库记录一致。
 *
 * assetId / intoAssetId 用 0 表示「未设置」（与项目「0 代表空」约定一致）：
 * - 支出/收入：assetId 为付款/收款资产，0 表示不关联资产；
 * - 转账：assetId 为转出资产，intoAssetId 为转入资产，均需 > 0。
 */
export interface QuickTemplate {
  /** 模板主键，会话内 Date.now()+自增计数生成 */
  id: string;
  /** 所属账本 ID（与 store 分组键一致，冗余但便于校验） */
  booksId: number;
  /** 展示名称，如「通勤支出」 */
  name: string;
  /** 记录大类，决定直接新建与预填编辑走哪个 tab */
  typeCategory: RecordTypeCategoryValue;
  /** 关联 tb_type.id */
  typeId: number;
  /** 原始金额，单位：分 */
  amount: number;
  /** 手续费，单位：分 */
  charge: number;
  /** 备注 */
  remark: string;
  /** 关联资产 ID（支出=付款、收入=收款、转账=转出），0 表示无 */
  assetId: number;
  /** 转入资产 ID（仅转账），0 表示无 */
  intoAssetId: number;
  /** 是否可报销，仅支出有意义 */
  reimbursable: boolean;
  /** 标签 ID 列表 */
  tagIds: number[];
  /** 可选 phosphor 图标名，缺省时由调用方取分类图标 */
  icon?: string;
  /** 排序权重，值越小越靠前 */
  sort: number;
}

/** 新建模板表单的初始值（不含 id/sort，由 store 补齐）。 */
export type NewQuickTemplate = Omit<QuickTemplate, 'id' | 'sort'>;

let idCounter = 0;

/**
 * 生成模板 ID。结合时间戳与会话自增计数，跨会话时间戳前缀避免碰撞。
 */
export function createTemplateId(): string {
  idCounter += 1;
  return `tpl_${Date.now().toString(36)}_${idCounter}`;
}

/**
 * 构造一个空白模板（表单初始值）。typeCategory 默认支出。
 */
export function createBlankTemplate(booksId: number): NewQuickTemplate {
  return {
    booksId,
    name: '',
    typeCategory: 'expense',
    typeId: 0,
    amount: 0,
    charge: 0,
    remark: '',
    assetId: 0,
    intoAssetId: 0,
    reimbursable: false,
    tagIds: [],
  };
}
