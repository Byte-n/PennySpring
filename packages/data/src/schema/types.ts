import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { SYSTEM_STATUS } from '../constants'
import { integerColumn, primaryKeyColumn, timestampColumns } from '../shared'

export const types = sqliteTable('tb_type', {
  // 类型主键，自增长
  id: primaryKeyColumn(),
  // 父类型 ID，0 表示一级类型（顶级）
  parentId: integerColumn('parent_id').notNull().default(0),
  // 类型名称（如"餐饮"、"工资"）
  name: text('name').notNull(),
  // 类型图标 key，由应用层硬编码维护
  icon: text('icon').notNull(),
  /**
   * 类型分类 key。
   *
   * 可选值来自 {@link import('../constants').RECORD_TYPE_CATEGORY}。
   */
  typeCategory: text('type_category').notNull(),
  /**
   * 是否系统内置 key。
   *
   * 可选值来自 {@link import('../constants').SYSTEM_STATUS}。
   */
  isSystem: text('is_system').notNull().default(SYSTEM_STATUS.custom),
  // 排序权重，值越小越靠前
  sort: integerColumn('sort').notNull().default(1),
  // 记录创建时间（时间戳，毫秒），INSERT 时自动写入
  // 最后修改时间（时间戳，毫秒），
  ...timestampColumns(),
})
