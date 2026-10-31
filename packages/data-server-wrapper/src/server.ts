import type { Api } from '@pennyspring/data'
import { Hono } from 'hono'

import { registerMediaRoutes } from './media'

const KNOWN_GROUPS = [
  'record',
  'tag',
  'type',
  'book',
  'asset',
  'agent',
  'provider',
  'credential',
  'quickTemplate',
  'quickBook',
] as const
type Group = (typeof KNOWN_GROUPS)[number]

type RemoteMethod = (...args: unknown[]) => Promise<unknown>

function resolveMethod(api: Api, group: string, method: string): RemoteMethod | null {
  if (!KNOWN_GROUPS.includes(group as Group)) return null
  const groupApi = (api as unknown as Record<string, unknown>)[group]
  if (typeof groupApi !== 'object' || groupApi === null) return null
  const fn = (groupApi as Record<string, unknown>)[method]
  if (typeof fn !== 'function') return null
  return fn as RemoteMethod
}

export interface CreateServerOptions {
  mediaDir?: string
}

/**
 * 通用派发：POST /api/<group>/<method>，请求体=参数数组，响应={result}|{error}。
 * 按约定调用 api2[group][method](...args)；不在此开事务，事务边界在 services。
 */
export function createServer(
  api2: Api,
  options: CreateServerOptions = {},
): Hono {
  const app = new Hono()
  registerMediaRoutes(app, api2, options.mediaDir)
  app.post('/api/:group/:method', async (c) => {
    const { group, method } = c.req.param()
    const fn = resolveMethod(api2, group, method)
    if (!fn) {
      return c.json({ error: `未知路由: ${group}/${method}` }, 404)
    }
    let body: unknown
    try {
      body = await c.req.json()
    } catch {
      return c.json({ error: '请求体格式不正确' }, 400)
    }
    if (!Array.isArray(body)) {
      return c.json({ error: '请求体必须是参数数组' }, 400)
    }
    const args: unknown[] = body
    try {
      const result = await fn(...args)
      return c.json({ result })
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      return c.json({ error: message }, 500)
    }
  })
  return app
}
