import { sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'

import { REIMBURSABLE } from '../constants'
import { integerColumn, primaryKeyColumn, timestampColumns } from '../shared'
import { assets } from './assets'
import { books } from './books'
import { tags } from './tags'
import { types } from './types'

export const records = sqliteTable('tb_record', {
  // 记录主键，自增长
  id: primaryKeyColumn(),
  // 类型 ID，关联 tb_type.id
  typeId: integerColumn('type_id')
    .notNull()
    .references(() => types.id),
  // 关联资产 ID，关联 tb_asset.id（转出资产）
  assetId: integerColumn('asset_id')
    .notNull()
    .references(() => assets.id),
  // 转入资产 ID，关联 tb_asset.id；仅转账类型使用，默认 0 表示无
  intoAssetId: integerColumn('into_asset_id')
    .notNull()
    .default(0)
    .references(() => assets.id),
  // 所属账本 ID，关联 tb_books.id
  booksId: integerColumn('books_id')
    .notNull()
    .references(() => books.id),
  // 原始金额，单位：分
  amount: integerColumn('amount').notNull().default(0),
  // 最终金额，单位：分（加上手续费后的实际金额、+/- 关联记录的金额）
  finalAmount: integerColumn('final_amount').notNull().default(0),
  // 手续费，单位：分
  charge: integerColumn('charge').notNull().default(0),
  // 备注信息
  remark: text('remark').notNull().default(''),
  /**
   * 是否可报销 key。
   *
   * 可选值来自 {@link import('../constants').REIMBURSABLE}。
   */
  reimbursable: text('reimbursable').notNull().default(REIMBURSABLE.notReimbursable),
  // 记账时间（时间戳，毫秒），业务字段，用户选择的记账日期
  recordTime: integerColumn('record_time').notNull(),
  // 记录创建时间（时间戳，毫秒），INSERT 时自动写入
  // 最后修改时间（时间戳，毫秒），
  ...timestampColumns(),
})

export const recordWithRecord = sqliteTable(
  'tb_record_with_record',
  {
    // 关系主键，自增长
    id: primaryKeyColumn(),
    // 记录 ID，关联 tb_record.id
    recordId: integerColumn('record_id')
      .notNull()
      .references(() => records.id),
    // 被关联的记录 ID，关联 tb_record.id
    relatedRecordId: integerColumn('related_record_id')
      .notNull()
      .references(() => records.id),
    // 记录创建时间（时间戳，毫秒），INSERT 时自动写入
    // 最后修改时间（时间戳，毫秒）
    ...timestampColumns(),
  },
  (table) => [
    unique('tb_record_with_record_record_id_related_record_id_unique').on(
      table.recordId,
      table.relatedRecordId
    ),
  ]
)

export const tagWithRecord = sqliteTable(
  'tb_tag_with_record',
  {
    // 关系主键，自增长
    id: primaryKeyColumn(),
    // 记录 ID，关联 tb_record.id
    recordId: integerColumn('record_id')
      .notNull()
      .references(() => records.id),
    // 标签 ID，关联 tb_tag.id
    tagId: integerColumn('tag_id')
      .notNull()
      .references(() => tags.id),
    // 记录创建时间（时间戳，毫秒），INSERT 时自动写入
    // 最后修改时间（时间戳，毫秒），
    ...timestampColumns(),
  },
  (table) => [unique('tb_tag_with_record_record_id_tag_id_unique').on(table.recordId, table.tagId)]
)

export const imageWithRelated = sqliteTable(
  'tb_image_with_related',
  {
    // 图片主键，自增长
    id: primaryKeyColumn(),
    // 关联记录 ID，关联 tb_record.id
    recordId: integerColumn('record_id')
      .notNull()
      .references(() => records.id),
    // 图片文件路径
    imagePath: text('image_path').notNull(),
    // 记录创建时间（时间戳，毫秒），INSERT 时自动写入
    // 最后修改时间（时间戳，毫秒），
    ...timestampColumns(),
  },
  (table) => [
    unique('tb_image_with_related_record_id_image_path_unique').on(table.recordId, table.imagePath),
  ]
)
