import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

import {
  type RecordTypeCategoryValue,
  type RecordTypeSpecialBehaviorValue,
  type SystemStatusValue,
  RECORD_TYPE_SPECIAL_BEHAVIOR,
  SYSTEM_STATUS,
} from '../constants';
import {
  enumColumn,
  integerColumn,
  primaryKeyColumn,
  timestampColumns,
} from '../shared';

export const types = sqliteTable('tb_type', {
  // 类型主键，自增长
  id: primaryKeyColumn(),
  // 所属账本主键，关联 tb_books.id
  booksId: integerColumn('books_id').notNull(),
  // 父类型 ID，0 表示一级类型（顶级）
  parentId: integerColumn('parent_id').notNull().default(0),
  // 类型名称（如"餐饮"、"工资"）
  name: text('name').notNull(),
  // 类型图标 pascalName，对应 phosphor-react-native 的 {pascalName}Icon 组件
  icon: text('icon').notNull(),
  /**
   * 类型分类 key。
   *
   * 可选值来自 {@link import('../constants').RECORD_TYPE_CATEGORY}。
   */
  typeCategory: enumColumn<RecordTypeCategoryValue>('type_category').notNull(),
  /**
   * 是否系统内置 key。
   *
   * 可选值来自 {@link import('../constants').SYSTEM_STATUS}。
   */
  isSystem: enumColumn<SystemStatusValue>('is_system')
    .notNull()
    .default(SYSTEM_STATUS.custom),
  /**
   * 特殊行为标识。
   *
   * 可选值来自 {@link import('../constants').RECORD_TYPE_SPECIAL_BEHAVIOR}。
   */
  specialBehavior: enumColumn<RecordTypeSpecialBehaviorValue>(
    'special_behavior',
  )
    .notNull()
    .default(RECORD_TYPE_SPECIAL_BEHAVIOR.none),
  // 排序权重，值越小越靠前
  sort: integerColumn('sort').notNull().default(1),
  // 记录创建时间（时间戳，毫秒），INSERT 时自动写入
  // 最后修改时间（时间戳，毫秒），
  ...timestampColumns(),
});
