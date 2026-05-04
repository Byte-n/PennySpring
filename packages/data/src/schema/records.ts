import { sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'

import { integerColumn, primaryKeyColumn, timestampColumns } from '../shared'
import { assets } from './assets'
import { books } from './books'
import { tags } from './tags'
import { types } from './types'

export const records = sqliteTable('tb_record', {
  id: primaryKeyColumn(),
  typeId: integerColumn('type_id')
    .notNull()
    .references(() => types.id),
  assetId: integerColumn('asset_id')
    .notNull()
    .references(() => assets.id),
  intoAssetId: integerColumn('into_asset_id')
    .notNull()
    .default(0)
    .references(() => assets.id),
  booksId: integerColumn('books_id')
    .notNull()
    .references(() => books.id),
  amount: integerColumn('amount').notNull().default(0),
  finalAmount: integerColumn('final_amount').notNull().default(0),
  concessions: integerColumn('concessions').notNull().default(0),
  charge: integerColumn('charge').notNull().default(0),
  remark: text('remark').notNull().default(''),
  reimbursable: integerColumn('reimbursable').notNull().default(1),
  recordTime: integerColumn('record_time').notNull(),
  ...timestampColumns(),
})

export const recordWithRecord = sqliteTable(
  'tb_record_with_record',
  {
    id: primaryKeyColumn(),
    recordId: integerColumn('record_id')
      .notNull()
      .references(() => records.id),
    relatedRecordId: integerColumn('related_record_id')
      .notNull()
      .references(() => records.id),
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
    id: primaryKeyColumn(),
    recordId: integerColumn('record_id')
      .notNull()
      .references(() => records.id),
    tagId: integerColumn('tag_id')
      .notNull()
      .references(() => tags.id),
    ...timestampColumns(),
  },
  (table) => [unique('tb_tag_with_record_record_id_tag_id_unique').on(table.recordId, table.tagId)]
)

export const imageWithRelated = sqliteTable(
  'tb_image_with_related',
  {
    id: primaryKeyColumn(),
    recordId: integerColumn('record_id')
      .notNull()
      .references(() => records.id),
    imagePath: text('image_path').notNull(),
    ...timestampColumns(),
  },
  (table) => [
    unique('tb_image_with_related_record_id_image_path_unique').on(table.recordId, table.imagePath),
  ]
)
