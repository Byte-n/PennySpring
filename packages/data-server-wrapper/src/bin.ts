import { serve } from '@hono/node-server'
import { networkInterfaces } from 'node:os'
import path from 'node:path'
import { createRemoteApi } from '@pennyspring/data-server'

import { createServer } from './server'
import { initializeDatabase } from './startup'

function getLocalAddresses(port: number): {
  local: string
  network: string[]
  ios: string
  android: string
} {
  const local = `http://localhost:${port}`
  const ios = `http://localhost:${port}`
  const android = `http://10.0.2.2:${port}`
  const network: string[] = []
  const nets = networkInterfaces()
  for (const name of Object.keys(nets)) {
    const interfaces = nets[name]
    if (!interfaces) continue
    for (const iface of interfaces) {
      if (iface.family === 'IPv4' && !iface.internal) {
        network.push(`http://${iface.address}:${port}`)
      }
    }
  }
  return { local, network, ios, android }
}

const dbPath = process.env.DB_PATH
if (!dbPath) {
  throw new Error('DB_PATH 未设置')
}
const port = Number(process.env.PORT ?? 3000)
const mediaDir =
  process.env.MEDIA_DIR ??
  path.join(path.dirname(path.resolve(dbPath)), 'media')
await initializeDatabase(dbPath)
const api = createRemoteApi({ dbPath })
const app = createServer(api, { mediaDir })

serve({ fetch: app.fetch, port }, (info) => {
  const { local, network, ios, android } = getLocalAddresses(info.port)
  console.log(`\n✓ 数据服务已启动`)
  console.log(`  本机地址:           ${local}`)
  console.log(`  iOS 模拟器访问:     ${ios}`)
  console.log(`  Android 模拟器访问: ${android}`)
  if (network.length > 0) {
    console.log(`  局域网地址:         ${network.join(', ')}`)
  }
  console.log()
})
