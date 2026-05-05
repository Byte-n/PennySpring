import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { VISIBILITY } from '../constants'
import { integerColumn, primaryKeyColumn, timestampColumns } from '../shared'
import { books } from './books'

export const assets = sqliteTable('tb_asset', {
  // 资产主键，自增长
  id: primaryKeyColumn(),
  // 所属账本主键，关联 tb_books.id
  booksId: integerColumn('books_id')
    .notNull()
    .references(() => books.id),
  // 资产名称（如"招商银行储蓄卡"）
  name: text('name').notNull(),
  // 当前余额，单位：分；通用资产为持有金额，信用卡/信用付为待还金额（正数=欠款）
  balance: integerColumn('balance').notNull().default(0),
  // 总额度，单位：分；仅信用卡使用
  totalAmount: integerColumn('total_amount').notNull().default(0),
  // 账单日；仅信用卡使用
  // SQL 文档写作 DEFAULT ''，这里归一化为 integer 0，保持“未设置账单日”的业务语义。
  billingDate: integerColumn('billing_date').notNull().default(0),
  // 还款日；仅信用卡使用
  // SQL 文档写作 DEFAULT ''，这里归一化为 integer 0，保持“未设置还款日”的业务语义。
  repaymentDate: integerColumn('repayment_date').notNull().default(0),
  /**
   * 资产大类 key。
   *
   * 可选值来自 {@link import('../constants').ASSET_TYPE}。
   */
  type: text('type').notNull(),
  /**
   * 资产分类 key。
   *
   * 可选值来自 {@link import('../constants').ASSET_CLASSIFICATION}。
   */
  classification: text('classification').notNull(),
  /**
   * 是否隐藏 key。
   *
   * 可选值来自 {@link import('../constants').VISIBILITY}。
   */
  invisible: text('invisible').notNull().default(VISIBILITY.visible),
  // 开户行名称
  openBank: text('open_bank').notNull().default(''),
  // 卡号
  cardNo: text('card_no').notNull().default(''),
  // 备注信息
  remark: text('remark').notNull().default(''),
  // 排序权重，值越小越靠前
  sort: integerColumn('sort').notNull().default(1),
  // 记录创建时间（时间戳，毫秒），INSERT 时自动写入
  // 最后修改时间（时间戳，毫秒），INSERT 和 UPDATE 时自动写入
  ...timestampColumns(),
})
