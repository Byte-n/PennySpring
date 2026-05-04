import { sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'

import { integerColumn, primaryKeyColumn, timestampColumns } from '../shared'

export const icons = sqliteTable(
  'tb_icon',
  {
    id: primaryKeyColumn(),
    key: text('key').notNull(),
    type: integerColumn('type').notNull().default(1),
    label: text('label').notNull().default(''),
    value: text('value').notNull(),
    alias: text('alias').notNull(),
    isSystem: integerColumn('is_system').notNull().default(1),
    sort: integerColumn('sort').notNull().default(1),
    ...timestampColumns(),
  },
  (table) => [unique('tb_icon_key_unique').on(table.key)]
)
