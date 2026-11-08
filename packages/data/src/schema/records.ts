import {
  sqliteTable,
  text,
  unique,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

import { type ReimbursableValue, REIMBURSABLE } from '../constants';
import {
  enumColumn,
  integerColumn,
  primaryKeyColumn,
  timestampColumns,
} from '../shared';

export const records = sqliteTable('tb_record', {
  // 记录主键，自增长
  id: primaryKeyColumn(),
  // 类型 ID，关联 tb_type.id
  typeId: integerColumn('type_id').notNull(),
  // 关联资产 ID，关联 tb_asset.id（转出资产）
  assetId: integerColumn('asset_id').notNull(),
  // 转入资产 ID，关联 tb_asset.id；仅转账类型使用，默认 0 表示无
  intoAssetId: integerColumn('into_asset_id').notNull().default(0),
  // 所属账本 ID，关联 tb_books.id
  booksId: integerColumn('books_id').notNull(),
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
   */
  reimbursable: enumColumn<ReimbursableValue>('reimbursable')
    .notNull()
    .default(REIMBURSABLE.notReimbursable),
  // 记账时间（时间戳，毫秒），业务字段，用户选择的记账日期
  recordTime: integerColumn('record_time').notNull(),
  // 记录创建时间（时间戳，毫秒），INSERT 时自动写入
  // 最后修改时间（时间戳，毫秒），
  ...timestampColumns(),
});

/** 记录创建的客户端幂等映射；同一账本同一键只对应一条记录。 */
export const recordClientMutations = sqliteTable(
  'tb_record_client_mutation',
  {
    id: primaryKeyColumn(),
    booksId: integerColumn('books_id').notNull(),
    clientMutationId: text('client_mutation_id').notNull(),
    recordId: integerColumn('record_id').notNull(),
    ...timestampColumns(),
  },
  table => [
    uniqueIndex(
      'tb_record_client_mutation_books_id_client_mutation_id_unique',
    ).on(table.booksId, table.clientMutationId),
  ],
);

export const recordWithRecord = sqliteTable(
  'tb_record_with_record',
  {
    // 关系主键，自增长
    id: primaryKeyColumn(),
    // 记录 ID，关联 tb_record.id
    recordId: integerColumn('record_id').notNull(),
    // 被关联的记录 ID，关联 tb_record.id
    relatedRecordId: integerColumn('related_record_id').notNull(),
    // 记录创建时间（时间戳，毫秒），INSERT 时自动写入
    // 最后修改时间（时间戳，毫秒）
    ...timestampColumns(),
  },
  table => [
    unique('tb_record_with_record_record_id_related_record_id_unique').on(
      table.recordId,
      table.relatedRecordId,
    ),
  ],
);

export const tagWithRecord = sqliteTable(
  'tb_tag_with_record',
  {
    // 关系主键，自增长
    id: primaryKeyColumn(),
    // 记录 ID，关联 tb_record.id
    recordId: integerColumn('record_id').notNull(),
    // 标签 ID，关联 tb_tag.id
    tagId: integerColumn('tag_id').notNull(),
    // 记录创建时间（时间戳，毫秒），INSERT 时自动写入
    // 最后修改时间（时间戳，毫秒），
    ...timestampColumns(),
  },
  table => [
    unique('tb_tag_with_record_record_id_tag_id_unique').on(
      table.recordId,
      table.tagId,
    ),
  ],
);

export const imageWithRelated = sqliteTable(
  'tb_image_with_related',
  {
    // 图片主键，自增长
    id: primaryKeyColumn(),
    // 关联记录 ID，关联 tb_record.id
    recordId: integerColumn('record_id').notNull(),
    // 图片文件路径
    imagePath: text('image_path').notNull(),
    // 记录创建时间（时间戳，毫秒），INSERT 时自动写入
    // 最后修改时间（时间戳，毫秒），
    ...timestampColumns(),
  },
  table => [
    unique('tb_image_with_related_record_id_image_path_unique').on(
      table.recordId,
      table.imagePath,
    ),
  ],
);
