import { serve } from '@hono/node-server'
import { createApi2 } from '@pennyspring/data-server'

import { createServer } from './server'

const dbPath = process.env.DB_PATH
if (!dbPath) {
  throw new Error('DB_PATH 未设置')
}
const port = Number(process.env.PORT ?? 3000)
const api2 = createApi2({ dbPath })
const app = createServer(api2)

serve({ fetch: app.fetch, port })
