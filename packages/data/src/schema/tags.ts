import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { type VisibilityValue, VISIBILITY } from '../constants';
import { enumColumn, primaryKeyColumn, timestampColumns } from '../shared'

export const tags = sqliteTable('tb_tag', {
  // 标签主键，自增长
  id: primaryKeyColumn(),
  // 标签名称
  name: text('name').notNull(),
  /**
   * 是否隐藏 key。
   */
  invisible: enumColumn<VisibilityValue>('invisible')
    .notNull()
    .default(VISIBILITY.visible),
  // 标签图标 pascalName；空字符串表示未设置
  icon: text('icon').notNull().default(''),
  // 记录创建时间（时间戳，毫秒），INSERT 时自动写入
  // 最后修改时间（时间戳，毫秒），
  ...timestampColumns(),
});
