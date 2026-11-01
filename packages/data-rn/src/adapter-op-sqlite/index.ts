import { type Api, createApi } from '@pennyspring/data';

import { getDatabase } from './getDatabase';

export function createLocalApi(): Api {
  return createApi(getDatabase);
}

export { createDatabase } from './database';
export { runMigrations } from './migrate';
export { getDatabase } from './getDatabase';
