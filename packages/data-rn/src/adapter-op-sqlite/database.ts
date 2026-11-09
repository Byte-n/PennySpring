import type { DB } from '@op-engineering/op-sqlite';
import { drizzle, type OPSQLiteDatabase } from 'drizzle-orm/op-sqlite';

import { schema, type DataSchema } from '@pennyspring/data';

import { applyOpSqliteTransactionFix } from './transaction';

export function createDatabase(connection: DB): OPSQLiteDatabase<DataSchema> {
  applyOpSqliteTransactionFix();
  return drizzle(connection, { schema });
}
