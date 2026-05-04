import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { integerColumn, primaryKeyColumn, timestampColumns } from '../shared'
import { icons } from './icons'

export const tags = sqliteTable('tb_tag', {
  id: primaryKeyColumn(),
  name: text('name').notNull(),
  invisible: integerColumn('invisible').notNull().default(1),
  iconId: integerColumn('icon_id')
    .notNull()
    .default(0)
    .references(() => icons.id),
  ...timestampColumns(),
})
