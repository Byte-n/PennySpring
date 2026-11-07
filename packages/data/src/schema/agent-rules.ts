import { sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';

import { integerColumn, primaryKeyColumn, timestampColumns } from '../shared';

/**
 * 账本级 AI 助手规则。空字符串表示使用应用内置默认规则；
 * 角色、工具用法与安全约束不存于此表，由提示词构建器固定拼接。
 */
export const agentRules = sqliteTable(
  'tb_agent_rules',
  {
    // 主键，自增长
    id: primaryKeyColumn(),
    // 所属账本主键，关联 tb_books.id
    booksId: integerColumn('books_id').notNull(),
    // 主对话规则；空字符串表示默认
    agentRules: text('agent_rules').notNull().default(''),
    // 截图草稿生成规则；空字符串表示默认
    quickBookRules: text('quick_book_rules').notNull().default(''),
    // 记录创建时间（时间戳，毫秒），INSERT 时自动写入
    // 最后修改时间（时间戳，毫秒）
    ...timestampColumns(),
  },
  table => [unique('tb_agent_rules_books_id_unique').on(table.booksId)],
);
