import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { integerColumn, primaryKeyColumn, timestampColumns } from '../shared'
import { icons } from './icons'

export const types = sqliteTable('tb_type', {
  id: primaryKeyColumn(),
  parentId: integerColumn('parent_id').notNull().default(0),
  name: text('name').notNull(),
  iconId: integerColumn('icon_id')
    .notNull()
    .references(() => icons.id),
  typeCategory: integerColumn('type_category').notNull(),
  isSystem: integerColumn('is_system').notNull().default(1),
  sort: integerColumn('sort').notNull().default(1),
  relativeRecordType: text('relative_record_type').default(''),
  ...timestampColumns(),
})
