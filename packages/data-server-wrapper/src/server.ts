import { createHash, timingSafeEqual } from 'node:crypto';

import type { Api } from '@pennyspring/data';
import { Hono } from 'hono';

import { registerMediaRoutes } from './media';

const AUTHORIZATION_PATTERN = /^Bearer\s+(.+)$/i;

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
  'agentRules',
  'agentConfig',
] as const;
type Group = (typeof KNOWN_GROUPS)[number];

type RemoteMethod = (...args: unknown[]) => Promise<unknown>;

function resolveMethod(
  api: Api,
  group: string,
  method: string,
): RemoteMethod | null {
  if (!KNOWN_GROUPS.includes(group as Group)) return null;
  const groupApi = (api as unknown as Record<string, unknown>)[group];
  if (typeof groupApi !== 'object' || groupApi === null) return null;
  const fn = (groupApi as Record<string, unknown>)[method];
  if (typeof fn !== 'function') return null;
  return fn as RemoteMethod;
}

export interface CreateServerOptions {
  token: string;
  mediaDir?: string;
}

function hashToken(token: string): Buffer {
  return createHash('sha256').update(token).digest();
}

function isAuthorized(
  authorization: string | undefined,
  token: string,
): boolean {
  const match = authorization
    ? AUTHORIZATION_PATTERN.exec(authorization)
    : null;
  if (!match?.[1]) return false;
  return timingSafeEqual(hashToken(match[1]), hashToken(token));
}

/**
 * 通用派发：POST /api/<group>/<method>，请求体=参数数组，响应={result}|{error}。
 * 按约定调用 api2[group][method](...args)；不在此开事务，事务边界在 services。
 * 所有路由（含媒体读写）统一校验 Authorization: Bearer <token>。
 */
export function createServer(api2: Api, options: CreateServerOptions): Hono {
  if (!options.token) {
    throw new Error('访问令牌不能为空');
  }
  const app = new Hono();
  app.use('*', async (c, next) => {
    if (!isAuthorized(c.req.header('authorization'), options.token)) {
      return c.json({ error: '访问令牌无效' }, 401);
    }
    await next();
  });
  registerMediaRoutes(app, api2, options.mediaDir);
  app.post('/api/:group/:method', async c => {
    const { group, method } = c.req.param();
    const fn = resolveMethod(api2, group, method);
    if (!fn) {
      return c.json({ error: `未知路由: ${group}/${method}` }, 404);
    }
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: '请求体格式不正确' }, 400);
    }
    if (!Array.isArray(body)) {
      return c.json({ error: '请求体必须是参数数组' }, 400);
    }
    const args: unknown[] = body;
    try {
      const result = await fn(...args);
      return c.json({ result });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      return c.json({ error: message }, 500);
    }
  });
  return app;
}
