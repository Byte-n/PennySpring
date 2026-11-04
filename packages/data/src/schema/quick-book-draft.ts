import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import type {
  QuickBookDraftSourceValue,
  QuickBookDraftStatusValue,
} from '../constants';
import {
  enumColumn,
  integerColumn,
  textPrimaryKeyColumn,
  timestampColumns,
} from '../shared';

/**
 * 截图记账草稿（设备级本地中间态）。
 *
 * 只存在于本地 SQLite：不随账本同步、备份、导出或局域网传输，
 * 远程服务器不提供草稿 API。逐笔内容以 DraftItem[] JSON 存于 payload。
 */
export const quickBookDrafts = sqliteTable(
  'tb_quick_book_draft',
  {
    // 草稿主键，UUID
    id: textPrimaryKeyColumn(),
    // 目标账本 ID，关联 tb_books.id；一期固定为截图时选择的本地账本
    booksId: integerColumn('books_id').notNull(),
    // 草稿组状态：generating | pending | failed | confirmed | discarded
    status: enumColumn<QuickBookDraftStatusValue>('status').notNull(),
    // 草稿来源：floating_capture | share | screenshot_nudge
    source: enumColumn<QuickBookDraftSourceValue>('source').notNull(),
    // 草稿截图文件路径
    imagePath: text('image_path').notNull(),
    // 逐笔草稿 JSON（DraftItem[]）
    payload: text('payload').notNull(),
    // 预设 JSON（{ assetId, typeId }）
    preset: text('preset').notNull(),
    // 生成草稿使用的提供商 ID；0 表示未记录
    agentProviderId: integerColumn('agent_provider_id').notNull().default(0),
    // 生成草稿使用的模型 ID；空字符串表示未记录
    agentModelId: text('agent_model_id').notNull().default(''),
    // Agent 生成摘要；空字符串表示未生成
    agentSummary: text('agent_summary').notNull().default(''),
    // 生成失败原因；空字符串表示无错误
    errorText: text('error_text').notNull().default(''),
    // 已写入记录的笔数
    confirmedCount: integerColumn('confirmed_count').notNull().default(0),
    // 已写入记录 ID JSON（number[]）
    recordIds: text('record_ids').notNull().default(''),
    // 记录创建时间（时间戳，毫秒），INSERT 时自动写入
    // 最后修改时间（时间戳，毫秒）
    ...timestampColumns(),
    // 全部笔确认完成的时间；0 表示未完成
    confirmedAt: integerColumn('confirmed_at').notNull().default(0),
  },
  table => [
    index('tb_quick_book_draft_status_updated_time_index').on(
      table.status,
      table.updatedTime,
    ),
    index('tb_quick_book_draft_books_id_status_index').on(
      table.booksId,
      table.status,
    ),
  ],
);
