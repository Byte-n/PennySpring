import type { DB } from '@op-engineering/op-sqlite'
import { drizzle } from 'drizzle-orm/op-sqlite'

import * as relations from '../../relations'
import * as tables from '../../schema'

export const schema = {
  ...tables,
  ...relations,
}

export type DataSchema = typeof schema
export type Database = ReturnType<typeof createDatabase>

export function createDatabase(connection: DB): ReturnType<typeof drizzle<DataSchema>> {
  return drizzle(connection, { schema })
}
