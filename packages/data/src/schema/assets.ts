import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { integerColumn, primaryKeyColumn, timestampColumns } from '../shared'
import { books } from './books'
import { icons } from './icons'

export const assetClassifications = sqliteTable('tb_asset_classification', {
  id: primaryKeyColumn(),
  label: text('label').notNull(),
  iconId: integerColumn('icon_id')
    .notNull()
    .references(() => icons.id),
  assetType: integerColumn('asset_type').notNull(),
  isSystem: integerColumn('is_system').notNull().default(1),
  sort: integerColumn('sort').notNull().default(1),
  ...timestampColumns(),
})

export const assets = sqliteTable('tb_asset', {
  id: primaryKeyColumn(),
  booksId: integerColumn('books_id')
    .notNull()
    .references(() => books.id),
  name: text('name').notNull(),
  balance: integerColumn('balance').notNull().default(0),
  totalAmount: integerColumn('total_amount').notNull().default(0),
  // SQL 文档写作 DEFAULT ''，这里归一化为 integer 0，保持“未设置账单日”的业务语义。
  billingDate: integerColumn('billing_date').notNull().default(0),
  // SQL 文档写作 DEFAULT ''，这里归一化为 integer 0，保持“未设置还款日”的业务语义。
  repaymentDate: integerColumn('repayment_date').notNull().default(0),
  type: integerColumn('type').notNull(),
  classificationId: integerColumn('classification_id')
    .notNull()
    .references(() => assetClassifications.id),
  invisible: integerColumn('invisible').notNull().default(1),
  openBank: text('open_bank').notNull().default(''),
  cardNo: text('card_no').notNull().default(''),
  remark: text('remark').notNull().default(''),
  sort: integerColumn('sort').notNull().default(1),
  ...timestampColumns(),
})
