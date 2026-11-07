import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'node:path';

import { schema } from '../src/db';
import { createBook } from '../src/services/book-service';
import {
  getAgentRules,
  MAX_AGENT_RULES_LENGTH,
  setAgentRules,
} from '../src/services/agent-rules-service';
import type { Database as AppDatabase } from '../src/types';

const MIGRATIONS_FOLDER = path.resolve(__dirname, '../drizzle');

function createTestDatabase(): AppDatabase {
  const connection = new Database(':memory:');
  const db = drizzle(connection, { schema });
  migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  const patched = db as unknown as {
    transaction: (fn: (tx: unknown) => Promise<unknown>) => Promise<unknown>;
  };
  patched.transaction = fn => fn(db);
  return db as unknown as AppDatabase;
}

describe('agent-rules-service', () => {
  it('returns empty rules when the book has not customized them', async () => {
    const db = createTestDatabase();
    const book = await createBook(db, { name: '家庭账本' });

    const rules = await getAgentRules(db, book.id);

    expect(rules).toEqual({
      booksId: book.id,
      agentRules: '',
      quickBookRules: '',
      createdTime: 0,
      updatedTime: 0,
    });
  });

  it('stores rules for the current book only', async () => {
    const db = createTestDatabase();
    const first = await createBook(db, { name: '家庭账本' });
    const second = await createBook(db, { name: '工作账本' });

    await setAgentRules(db, {
      booksId: first.id,
      agentRules: '  金额不确定时先追问。  ',
      quickBookRules: '日期不明确按今天。',
    });

    await expect(getAgentRules(db, first.id)).resolves.toMatchObject({
      booksId: first.id,
      agentRules: '金额不确定时先追问。',
      quickBookRules: '日期不明确按今天。',
    });
    await expect(getAgentRules(db, second.id)).resolves.toMatchObject({
      booksId: second.id,
      agentRules: '',
      quickBookRules: '',
    });
  });

  it('overwrites existing rules instead of inserting a second row', async () => {
    const db = createTestDatabase();
    const book = await createBook(db, { name: '家庭账本' });

    await setAgentRules(db, {
      booksId: book.id,
      agentRules: '旧规则',
      quickBookRules: '旧草稿规则',
    });
    await setAgentRules(db, {
      booksId: book.id,
      agentRules: '新规则',
      quickBookRules: '新草稿规则',
    });

    await expect(getAgentRules(db, book.id)).resolves.toMatchObject({
      agentRules: '新规则',
      quickBookRules: '新草稿规则',
    });
  });

  it('rejects a book that does not exist', async () => {
    const db = createTestDatabase();

    await expect(
      setAgentRules(db, {
        booksId: 999,
        agentRules: '规则',
        quickBookRules: '',
      }),
    ).rejects.toThrow('Books not found: 999');
  });

  it('rejects rules longer than the limit', async () => {
    const db = createTestDatabase();
    const book = await createBook(db, { name: '家庭账本' });

    await expect(
      setAgentRules(db, {
        booksId: book.id,
        agentRules: '规'.repeat(MAX_AGENT_RULES_LENGTH + 1),
        quickBookRules: '',
      }),
    ).rejects.toThrow('规则不能超过');
  });
});
