import Database from 'better-sqlite3'
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'

import { schema, type DataSchema } from '@pennyspring/data'

export type BetterSqliteConnection = InstanceType<typeof Database>

export function createDatabase(connection: BetterSqliteConnection): BetterSQLite3Database<DataSchema> {
  return drizzle(connection, { schema })
}
