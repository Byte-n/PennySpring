import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { type BookTypeValue, BOOK_TYPE } from '../constants';
import { enumColumn, primaryKeyColumn, timestampColumns } from '../shared'

export const books = sqliteTable('tb_books', {
  // 账本主键，自增长
  id: primaryKeyColumn(),
  // 账本名称
  name: text('name').notNull(),
  // 账本描述信息
  description: text('description').notNull().default(''),
  // 背景图片 URI
  background: text('background').notNull().default(''),
  // 账本类型 key：local=本地账本，remote=远程账本
  type: enumColumn<BookTypeValue>('type')
    .notNull()
    .default(BOOK_TYPE.local),
  // 远程账本地址；type 为 remote 时必填
  remoteUrl: text('remote_url').notNull().default(''),
  // 记录创建时间（时间戳，毫秒），INSERT 时自动写入
  // 最后修改时间（时间戳，毫秒），INSERT 和 UPDATE 时自动写入
  ...timestampColumns(),
})
