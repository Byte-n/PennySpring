import { createRequire } from 'node:module'
import path from 'node:path'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'

import type { DataSchema } from '@pennyspring/data'

export function runMigrations(db: BetterSQLite3Database<DataSchema>): void {
  const require = createRequire(import.meta.url)
  const dataPkgPath = require.resolve('@pennyspring/data/package.json')
  const migrationsFolder = path.join(path.dirname(dataPkgPath), 'drizzle')
  migrate(db, { migrationsFolder })
}
