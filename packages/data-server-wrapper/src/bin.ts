import { serve } from '@hono/node-server'
import { createRemoteApi } from '@pennyspring/data-server'

import { createServer } from './server'

const dbPath = process.env.DB_PATH
if (!dbPath) {
  throw new Error('DB_PATH 未设置')
}
const port = Number(process.env.PORT ?? 3000)
const api = createRemoteApi({ dbPath })
const app = createServer(api)

serve({ fetch: app.fetch, port })
