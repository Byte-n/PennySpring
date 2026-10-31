jest.mock('@pennyspring/data-server', () => ({ getDatabase: jest.fn() }));
import { getDatabase } from '@pennyspring/data-server';
import type { Database } from '@pennyspring/data';
import {
  initializeDatabase,
  resolveServerToken,
} from '../packages/data-server-wrapper/src/startup';

const mockGetDatabase = jest.mocked(getDatabase);

describe('data-server 启动初始化', () => {
  it('在返回前完成数据库迁移', async () => {
    const database = {} as Database;
    mockGetDatabase.mockResolvedValueOnce(database);

    const result = await initializeDatabase('/tmp/server.db');

    expect(result).toBe(database);
    expect(mockGetDatabase).toHaveBeenCalledWith('/tmp/server.db');
  });
});

describe('resolveServerToken', () => {
  it('要求设置 SERVER_TOKEN', () => {
    expect(() => resolveServerToken(undefined)).toThrow('SERVER_TOKEN 未设置');
    expect(() => resolveServerToken('   ')).toThrow('SERVER_TOKEN 未设置');
  });

  it('拒绝过短的令牌', () => {
    expect(() => resolveServerToken('st')).toThrow(
      'SERVER_TOKEN 长度不能少于 3 个字符',
    );
  });

  it('返回去除首尾空白后的令牌', () => {
    const token = 'test-token-0123456789';

    expect(resolveServerToken(`  ${token}  `)).toBe(token);
  });
});
