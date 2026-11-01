import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'node:path';

import { schema } from '../src/db';
import {
  appendMessages,
  createThread,
  deleteThread,
  getLatestThreadWithMessages,
  getThreadDetail,
  listThreads,
  updateThreadTitle,
} from '../src/services/agent-service';
import type { Database as AppDatabase } from '../src/types';

const MIGRATIONS_FOLDER = path.resolve(__dirname, '../drizzle');

function createTestDatabase(): AppDatabase {
  const connection = new Database(':memory:');
  const db = drizzle(connection, { schema });
  migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  // better-sqlite3 是同步驱动，不接受 async 事务回调（生产用的 op-sqlite 是异步驱动）。
  // 测试里让事务直通，只验证 SQL 行为；事务原子性由真实驱动保证。
  const patched = db as unknown as {
    transaction: (fn: (tx: unknown) => Promise<unknown>) => Promise<unknown>;
  };
  patched.transaction = fn => fn(db);
  return db as unknown as AppDatabase;
}

const USER_MESSAGE_JSON = JSON.stringify({
  id: 'user-1',
  role: 'user',
  parts: [{ type: 'text', text: '你好' }],
});
const ASSISTANT_MESSAGE_JSON = JSON.stringify({
  id: 'assistant-1',
  role: 'assistant',
  parts: [
    { type: 'text', text: '你好' },
    {
      type: 'tool-queryRecords',
      toolCallId: 'call_1',
      state: 'output-available',
      input: {},
      output: { total: 123 },
    },
  ],
});

const EMPTY_SELECTION = { providerId: 0, modelId: '' };

describe('agent-service', () => {
  let db: AppDatabase;

  beforeEach(async () => {
    db = createTestDatabase();
    await db
      .insert(schema.books)
      .values([{ name: '账本 1' }, { name: '账本 2' }, { name: '账本 3' }]);
  });

  it('createThread 允许同一账本创建多条独立会话', async () => {
    const first = await createThread(db, 1, EMPTY_SELECTION);
    const second = await createThread(db, 1, EMPTY_SELECTION);

    expect(second.id).not.toBe(first.id);
    expect((await listThreads(db, 1)).map(thread => thread.id)).toEqual(
      expect.arrayContaining([first.id, second.id]),
    );
  });

  it('listThreads 只返回指定账本的会话', async () => {
    const own = await createThread(db, 1, EMPTY_SELECTION);
    await createThread(db, 2, EMPTY_SELECTION);

    expect((await listThreads(db, 1)).map(thread => thread.id)).toEqual([
      own.id,
    ]);
  });

  it('listThreads 按最后更新时间倒序排列', async () => {
    const older = await createThread(db, 1, EMPTY_SELECTION);
    const newer = await createThread(db, 1, EMPTY_SELECTION);
    const future = Date.now() + 60_000;
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(future);
    try {
      await updateThreadTitle(db, older.id, '刚聊过的会话');
    } finally {
      nowSpy.mockRestore();
    }

    expect((await listThreads(db, 1)).map(thread => thread.id)).toEqual([
      older.id,
      newer.id,
    ]);
  });

  it('getLatestThreadWithMessages 返回最近更新的会话及其消息', async () => {
    const older = await createThread(db, 1, EMPTY_SELECTION);
    const newer = await createThread(db, 1, EMPTY_SELECTION);
    const future = Date.now() + 60_000;
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(future);
    try {
      await appendMessages(db, older.id, [
        { role: 'user', message: USER_MESSAGE_JSON },
      ]);
    } finally {
      nowSpy.mockRestore();
    }

    const detail = await getLatestThreadWithMessages(db, 1, EMPTY_SELECTION);

    expect(detail).not.toBeNull();
    if (!detail) throw new Error('expected latest thread');
    expect(detail.thread.id).toBe(older.id);
    expect(detail.thread.id).not.toBe(newer.id);
    expect(detail.messages).toHaveLength(1);
  });

  it('getLatestThreadWithMessages 在账本没有会话时返回空结果', async () => {
    const detail = await getLatestThreadWithMessages(db, 3, EMPTY_SELECTION);

    expect(detail).toBeNull();
    expect(await listThreads(db, 3)).toEqual([]);
  });

  it('getThreadDetail 返回指定会话的完整消息链', async () => {
    const thread = await createThread(db, 1, EMPTY_SELECTION);
    await createThread(db, 1, EMPTY_SELECTION);
    await appendMessages(db, thread.id, [
      { role: 'user', message: USER_MESSAGE_JSON },
      { role: 'assistant', message: ASSISTANT_MESSAGE_JSON },
    ]);

    const detail = await getThreadDetail(db, thread.id);

    expect(detail.thread.id).toBe(thread.id);
    expect(detail.messages).toHaveLength(2);
    expect(detail.messages[1]?.message).toContain('tool-queryRecords');
    expect(detail.messages[1]?.message).toContain('call_1');
    expect(detail.messages[1]?.message).toContain('output-available');
  });

  it('appendMessages 持久化消息并保持写入顺序', async () => {
    const thread = await createThread(db, 1, EMPTY_SELECTION);

    const saved = await appendMessages(db, thread.id, [
      { role: 'user', message: USER_MESSAGE_JSON },
      { role: 'assistant', message: ASSISTANT_MESSAGE_JSON },
    ]);

    expect(saved.map(message => message.role)).toEqual(['user', 'assistant']);
    expect(saved.map(message => message.threadId)).toEqual([
      thread.id,
      thread.id,
    ]);
  });

  it('updateThreadTitle 更新会话标题', async () => {
    const thread = await createThread(db, 1, EMPTY_SELECTION);

    const updated = await updateThreadTitle(db, thread.id, '本月支出');

    expect(updated.title).toBe('本月支出');
  });

  it('updateThreadTitle 拒绝空标题', async () => {
    const thread = await createThread(db, 1, EMPTY_SELECTION);

    await expect(updateThreadTitle(db, thread.id, '   ')).rejects.toThrow(
      '会话标题不能为空',
    );
  });

  it('appendMessages 拒绝写入不存在的会话', async () => {
    await expect(
      appendMessages(db, 999, [{ role: 'user', message: USER_MESSAGE_JSON }]),
    ).rejects.toThrow('会话不存在: 999');
  });

  it('deleteThread 删除会话及其全部消息', async () => {
    const thread = await createThread(db, 1, EMPTY_SELECTION);
    await appendMessages(db, thread.id, [
      { role: 'user', message: USER_MESSAGE_JSON },
    ]);

    await deleteThread(db, thread.id);

    await expect(getThreadDetail(db, thread.id)).rejects.toThrow(
      `会话不存在: ${thread.id}`,
    );
    expect(await listThreads(db, 1)).toEqual([]);
  });

  it('deleteThread 拒绝删除不存在的会话', async () => {
    await expect(deleteThread(db, 999)).rejects.toThrow('会话不存在: 999');
  });
});
