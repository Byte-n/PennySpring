import type { Database } from '@pennyspring/data';
import { getDatabase } from '@pennyspring/data-server';

const MIN_SERVER_TOKEN_LENGTH = 3;

/**
 * 初始化服务端数据库。
 * getDatabase 会按需打开连接、执行所有未应用迁移并完成默认数据初始化。
 */
export async function initializeDatabase(dbPath: string): Promise<Database> {
  return getDatabase(dbPath);
}

/**
 * 启动必须提供足够长度的访问令牌，避免以空令牌或弱口令对外服务。
 */
export function resolveServerToken(value: string | undefined): string {
  const token = value?.trim() ?? '';
  if (!token) {
    throw new Error('SERVER_TOKEN 未设置');
  }
  if (token.length < MIN_SERVER_TOKEN_LENGTH) {
    throw new Error(
      `SERVER_TOKEN 长度不能少于 ${MIN_SERVER_TOKEN_LENGTH} 个字符`,
    );
  }
  return token;
}
