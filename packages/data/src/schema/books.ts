import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { primaryKeyColumn, timestampColumns } from '../shared'

export const books = sqliteTable('tb_books', {
  id: primaryKeyColumn(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  background: text('background').notNull().default(''),
  ...timestampColumns(),
})
