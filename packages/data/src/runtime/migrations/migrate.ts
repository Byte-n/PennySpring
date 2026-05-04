import { migrate } from 'drizzle-orm/op-sqlite/migrator'

import type { Database } from '../client'
import { migrations } from './bundle'

export async function runMigrations(db: Database): Promise<void> {
  await migrate(db, migrations)
}
