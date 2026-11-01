import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';

import type { DataSchema } from './db';

/**
 * Canonical async Database（driver 无关）。
 *
 * TRunResult 留作 opaque（unknown）：services 从不读 .run() 结果，只用 .get()/.all()/.returning()，
 * 故两端运行结果类型差异不影响 service 代码。op-sqlite（'async'）天然 conform；better-sqlite3（'sync'）
 * 在 data-server 适配器出口断言为 'async'。选 async canonical 用类型系统强制 await 纪律——
 * 正因为强制 await，sync 驱动才行为一致。
 */
export type Database = BaseSQLiteDatabase<'async', unknown, DataSchema>;

export type Tx = Parameters<Parameters<Database['transaction']>[0]>[0];
