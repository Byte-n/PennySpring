import { sql } from 'drizzle-orm';
import { integer } from 'drizzle-orm/sqlite-core';

const CURRENT_EPOCH_MILLIS_SQL = sql`(cast(unixepoch('subsec') * 1000 as integer))`;

export const currentEpochMillisSql = CURRENT_EPOCH_MILLIS_SQL;

export function createdTimeColumn() {
  return integer('created_time', { mode: 'number' })
    .notNull()
    .default(CURRENT_EPOCH_MILLIS_SQL);
}

export function updatedTimeColumn() {
  return integer('updated_time', { mode: 'number' })
    .notNull()
    .default(CURRENT_EPOCH_MILLIS_SQL)
    .$onUpdateFn(() => Date.now());
}
