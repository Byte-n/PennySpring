import type { DB } from '@op-engineering/op-sqlite'
import { drizzle, type OPSQLiteDatabase } from 'drizzle-orm/op-sqlite'

import { schema, type DataSchema } from '@pennyspring/data'

export function createDatabase(connection: DB): OPSQLiteDatabase<DataSchema> {
  return drizzle(connection, { schema })
}
