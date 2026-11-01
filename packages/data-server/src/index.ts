import { createApi, type Api } from '@pennyspring/data';

import { getDatabase } from './adapter-better-sqlite/getDatabase';

export function createRemoteApi({ dbPath }: { dbPath: string }): Api {
  return createApi(() => getDatabase(dbPath));
}

export { createDatabase } from './adapter-better-sqlite/database';
export { runMigrations } from './adapter-better-sqlite/migrate';
export { getDatabase } from './adapter-better-sqlite/getDatabase';
