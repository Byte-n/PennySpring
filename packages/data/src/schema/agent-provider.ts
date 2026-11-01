import { sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';

import type { AgentSelectionScope } from '../constants';
import {
  enumColumn,
  integerColumn,
  primaryKeyColumn,
  timestampColumns,
} from '../shared';

/**
 * 服务器级 AI 提供商配置。不带 booksId：同一服务器/本地库的多本账本共享。
 * models 存 JSON（AgentProviderModel[]）。
 */
export const agentProviders = sqliteTable('tb_agent_provider', {
  // 提供商主键，服务端自增，跨设备稳定
  id: primaryKeyColumn(),
  // 提供商类型 key，对应内置 descriptor
  descriptorId: text('descriptor_id').notNull(),
  // 展示名称
  name: text('name').notNull().default(''),
  // API Base URL
  baseUrl: text('base_url').notNull().default(''),
  // 默认模型 id；空字符串表示未设置
  defaultModelId: text('default_model_id').notNull().default(''),
  // 模型配置 JSON（AgentProviderModel[]）
  models: text('models').notNull().default('[]'),
  // 是否存储模型响应；1/0
  storeResponses: integerColumn('store_responses').notNull().default(1),
  // 记录创建时间（时间戳，毫秒），INSERT 时自动写入
  // 最后修改时间（时间戳，毫秒）
  ...timestampColumns(),
});

/**
 * 账本级 API Key。按 booksId 隔离：同一服务器内不同账本各自配置。
 */
export const bookProviderKeys = sqliteTable(
  'tb_book_provider_key',
  {
    // 主键，自增长
    id: primaryKeyColumn(),
    // 所属账本主键，关联 tb_books.id
    booksId: integerColumn('books_id').notNull(),
    // 提供商主键，关联 tb_agent_provider.id
    providerId: integerColumn('provider_id').notNull(),
    // API Key；空字符串表示未设置
    apiKey: text('api_key').notNull().default(''),
    // 记录创建时间（时间戳，毫秒），INSERT 时自动写入
    // 最后修改时间（时间戳，毫秒）
    ...timestampColumns(),
  },
  table => [
    unique('tb_book_provider_key_books_id_provider_id_unique').on(
      table.booksId,
      table.providerId,
    ),
  ],
);

/**
 * 服务器级模型选择。scope 区分 Agent 新会话默认值与快捷记账默认值。
 */
export const agentSelections = sqliteTable(
  'tb_agent_selection',
  {
    // 主键，自增长
    id: primaryKeyColumn(),
    // 作用域：agent / quickBook
    scope: enumColumn<AgentSelectionScope>('scope').notNull(),
    // 提供商主键；0 表示未设置
    providerId: integerColumn('provider_id').notNull().default(0),
    // 模型 id；空字符串表示未设置
    modelId: text('model_id').notNull().default(''),
    // 记录创建时间（时间戳，毫秒），INSERT 时自动写入
    // 最后修改时间（时间戳，毫秒）
    ...timestampColumns(),
  },
  table => [unique('tb_agent_selection_scope_unique').on(table.scope)],
);
