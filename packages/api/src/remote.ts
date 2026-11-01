import type { Api } from '@pennyspring/data';

import { buildPath } from './contract';

export const REMOTE_API_TIMEOUT_MS = 10_000;

export interface RemoteApiOptions {
  token: string;
  timeoutMs?: number;
  timeoutMessage?: string;
}

/**
 * 通用 POST：请求体=参数数组（按位置），响应={result}|{error}。
 * 与 data-server-wrapper 约定一致；T 由调用点的 Api 形状从返回类型推断。
 */
async function call<T>(
  serverUrl: string,
  group: string,
  method: string,
  args: unknown[],
  options: Required<RemoteApiOptions>,
): Promise<T> {
  if (!serverUrl) {
    throw new Error('SERVER_URL 未设置（remote 模式需构建期注入）');
  }
  if (!options.token) {
    throw new Error('服务器访问令牌未配置');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs);
  try {
    const res = await fetch(`${serverUrl}${buildPath(group, method)}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${options.token}`,
      },
      body: JSON.stringify(args),
      signal: controller.signal,
    });
    const data = (await res.json()) as { result?: unknown; error?: string };
    if (!res.ok) {
      throw new Error(data.error ?? `HTTP ${res.status}`);
    }
    if (data.error) {
      throw new Error(data.error);
    }
    return data.result as T;
  } catch (error: unknown) {
    if (controller.signal.aborted) {
      throw new Error(options.timeoutMessage);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * remote api：用 Proxy 把 `api[group][method](...args)` 统一映射为
 * `call(group, method, args)`。契约为纯位置式（group+method+参数数组），
 * 故无需逐方法列举；新增 service 自动获得 remote 支持。
 *
 * 注意：group 是拦截代理，勿 `await api.group`（不按方法调用而是直接 await
 * 会触发其 thenable 行为，发起一次无意义的 fetch）。
 */
export function createRemoteApi(
  serverUrl: string,
  options: RemoteApiOptions,
): Api {
  const requestOptions: Required<RemoteApiOptions> = {
    token: options.token,
    timeoutMs: options.timeoutMs ?? REMOTE_API_TIMEOUT_MS,
    timeoutMessage: options.timeoutMessage ?? '服务器请求超时',
  };
  const groupCache = new Map<string, unknown>();

  const getGroup = (group: string) => {
    const cached = groupCache.get(group);
    if (cached) return cached;
    const proxy = new Proxy(
      {} as Record<string, (...args: unknown[]) => Promise<unknown>>,
      {
        get: (_target, method) => {
          if (typeof method === 'symbol') return undefined;
          return (...args: unknown[]) =>
            call(serverUrl, group, method, args, requestOptions);
        },
      },
    );
    groupCache.set(group, proxy);
    return proxy;
  };

  return new Proxy({} as Record<string, unknown>, {
    get: (_target, group) => {
      if (typeof group === 'symbol') return undefined;
      if (group === 'get') {
        return () => Promise.reject(new Error('remote 模式不支持 api.get'));
      }
      return getGroup(group);
    },
  }) as Api;
}
