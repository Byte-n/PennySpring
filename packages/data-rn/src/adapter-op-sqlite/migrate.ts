import type { OPSQLiteDatabase } from 'drizzle-orm/op-sqlite';
import { migrate } from 'drizzle-orm/op-sqlite/migrator';

import type { DataSchema } from '@pennyspring/data';
import migrations from '@pennyspring/data/drizzle/migrations';

export async function runMigrations(
  db: OPSQLiteDatabase<DataSchema>,
): Promise<void> {
  await migrate(db, migrations);
}
