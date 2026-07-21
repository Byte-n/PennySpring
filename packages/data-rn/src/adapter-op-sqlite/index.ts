import { createApi, type Api } from '@pennyspring/data'

import { getDatabase } from './getDatabase'

export function createApi1(): Api {
  return createApi(getDatabase)
}

export const api1 = createApi1()

export { createDatabase } from './database'
export { runMigrations } from './migrate'
export { getDatabase } from './getDatabase'
