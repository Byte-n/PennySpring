import type { CreateRecordInput, UpdateRecordInput } from './services';
export * from './services/types'
export * from './constants';
export * from './schema';
export * from './relations';
export { createDatabase, runMigrations, schema } from './runtime';

import { createDatabase, runMigrations, type Database } from './runtime';
import * as services from './services';

let dbInstance: Database | null = null;

async function getDatabase(): Promise<Database> {
  if (dbInstance) return dbInstance;

  const { open } = await import('@op-engineering/op-sqlite');
  const connection = open({ name: 'pennyspring.db' });
  dbInstance = createDatabase(connection);
  await runMigrations(dbInstance);

  return dbInstance;
}

export const api = {
  get: getDatabase,
  record: {
    create: async (input: CreateRecordInput) => {
      const database = await getDatabase();
      return services.createRecord(database, input);
    },
    update: async (input: UpdateRecordInput) => {
      const database = await getDatabase();
      return services.updateRecord(database, input);
    },
    delete: async (recordId: number) => {
      const database = await getDatabase();
      return services.deleteRecord(database, recordId);
    },
  },
};
