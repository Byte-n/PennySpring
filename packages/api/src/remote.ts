import type { Api } from '@pennyspring/data'

import { buildPath } from './contract'

const SERVER_URL = process.env.SERVER_URL
if (!SERVER_URL) {
  throw new Error('SERVER_URL 未设置（remote 模式需构建期注入）')
}

/**
 * 通用 POST：请求体=参数数组（按位置），响应={result}|{error}。
 * 与 data-server-wrapper 约定一致；T 由调用点的 Api 形状从返回类型推断。
 */
async function call<T>(group: string, method: string, args: unknown[]): Promise<T> {
  const res = await fetch(`${SERVER_URL}${buildPath(group, method)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(args),
  })
  const data = (await res.json()) as { result?: unknown; error?: string }
  if (!res.ok) {
    throw new Error(data.error ?? `HTTP ${res.status}`)
  }
  if (data.error) {
    throw new Error(data.error)
  }
  return data.result as T
}

/**
 * remote api：用 Proxy 把 `api[group][method](...args)` 统一映射为
 * `call(group, method, args)`。契约为纯位置式（group+method+参数数组），
 * 故无需逐方法列举；新增 service 自动获得 remote 支持。
 *
 * 注意：group 是拦截代理，勿 `await api.group`（不按方法调用而是直接 await
 * 会触发其 thenable 行为，发起一次无意义的 fetch）。
 */
function createRemoteApi(): Api {
  const groupCache = new Map<string, unknown>()

  const getGroup = (group: string) => {
    const cached = groupCache.get(group)
    if (cached) return cached
    const proxy = new Proxy(
      {} as Record<string, (...args: unknown[]) => Promise<unknown>>,
      {
        get: (_target, method) => {
          if (typeof method === 'symbol') return undefined
          return (...args: unknown[]) => call(group, method, args)
        },
      },
    )
    groupCache.set(group, proxy)
    return proxy
  }

  return new Proxy({} as Record<string, unknown>, {
    get: (_target, group) => {
      if (typeof group === 'symbol') return undefined
      if (group === 'get') {
        return () => Promise.reject(new Error('remote 模式不支持 api.get'))
      }
      return getGroup(group)
    },
  }) as Api
}

export const api = createRemoteApi()
