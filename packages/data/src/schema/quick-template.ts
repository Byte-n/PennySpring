import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core'

import {
  type RecordTypeCategoryValue,
  type ReimbursableValue,
  REIMBURSABLE,
} from '../constants'
import { enumColumn, integerColumn, primaryKeyColumn, timestampColumns } from '../shared'

/**
 * 账本级快捷记账模板。tagIds 以 JSON 数组存储。
 */
export const quickTemplates = sqliteTable(
  'tb_quick_template',
  {
    // 模板主键，自增长
    id: primaryKeyColumn(),
    // 所属账本主键，关联 tb_books.id
    booksId: integerColumn('books_id').notNull(),
    // 展示名称
    name: text('name').notNull().default(''),
    // 记录大类
    typeCategory: enumColumn<RecordTypeCategoryValue>('type_category').notNull(),
    // 关联 tb_type.id
    typeId: integerColumn('type_id').notNull().default(0),
    // 原始金额，单位：分
    amount: integerColumn('amount').notNull().default(0),
    // 手续费，单位：分
    charge: integerColumn('charge').notNull().default(0),
    // 备注
    remark: text('remark').notNull().default(''),
    // 关联资产 id；0 表示未设置
    assetId: integerColumn('asset_id').notNull().default(0),
    // 转入资产 id；0 表示未设置
    intoAssetId: integerColumn('into_asset_id').notNull().default(0),
    // 是否可报销
    reimbursable: enumColumn<ReimbursableValue>('reimbursable')
      .notNull()
      .default(REIMBURSABLE.notReimbursable),
    // 标签 id JSON 数组
    tagIds: text('tag_ids').notNull().default('[]'),
    // 图标 key；空字符串表示未设置
    icon: text('icon').notNull().default(''),
    // 排序权重，值越小越靠前
    sort: integerColumn('sort').notNull().default(1),
    // 记录创建时间（时间戳，毫秒），INSERT 时自动写入
    // 最后修改时间（时间戳，毫秒）
    ...timestampColumns(),
  },
  table => [index('tb_quick_template_books_id_index').on(table.booksId)],
)
