import { migrate } from 'drizzle-orm/op-sqlite/migrator';
import migrations from '../../../drizzle/migrations';
import type { Database } from '../client';

export async function runMigrations(db: Database): Promise<void> {
  await migrate(db, migrations);
}
