import Database from 'better-sqlite3';
import { drizzle, type OPSQLiteDatabase } from 'drizzle-orm/op-sqlite';

import { books, schema } from '@pennyspring/data';

import { runMigrations } from '../src/adapter-op-sqlite/migrate';
import { applyOpSqliteTransactionFix } from '../src/adapter-op-sqlite/transaction';
import { createFakeOpSqliteConnection } from '../test-utils/fakeOpSqliteConnection';

type DriverClient = Parameters<typeof drizzle>[0];
type Sqlite = InstanceType<typeof Database>;

applyOpSqliteTransactionFix();

async function createDatabaseFixture(): Promise<{
  db: OPSQLiteDatabase<typeof schema>;
  sqlite: Sqlite;
}> {
  const sqlite = new Database(':memory:');
  const connection = createFakeOpSqliteConnection(sqlite);
  await runMigrations(connection);
  const db = drizzle(connection as unknown as DriverClient, { schema });
  return { db, sqlite };
}

function bookNames(sqlite: Sqlite): string[] {
  return sqlite
    .prepare('SELECT name FROM tb_books ORDER BY id')
    .all()
    .map(row => String((row as { name: unknown }).name));
}

describe('op-sqlite 事务修复', () => {
  it('提交回调内的全部写入并返回回调结果', async () => {
    const { db, sqlite } = await createDatabaseFixture();

    const result = await db.transaction(async tx => {
      await tx.insert(books).values({ name: '事务账本' });
      return 'done';
    });

    expect(result).toBe('done');
    expect(bookNames(sqlite)).toEqual(['事务账本']);
  });

  it('回调抛错时回滚已经执行的写入', async () => {
    const { db, sqlite } = await createDatabaseFixture();

    await expect(
      db.transaction(async tx => {
        await tx.insert(books).values({ name: '半写账本' });
        throw new Error('boom');
      }),
    ).rejects.toThrow('boom');

    expect(bookNames(sqlite)).toEqual([]);
  });

  it('嵌套事务用保存点回滚，不影响外层已执行的写入', async () => {
    const { db, sqlite } = await createDatabaseFixture();

    await db.transaction(async tx => {
      await tx.insert(books).values({ name: '外层一' });
      await expect(
        tx.transaction(async nestedTx => {
          await nestedTx.insert(books).values({ name: '内层' });
          throw new Error('nested-boom');
        }),
      ).rejects.toThrow('nested-boom');
      await tx.insert(books).values({ name: '外层二' });
    });

    expect(bookNames(sqlite)).toEqual(['外层一', '外层二']);
  });
});
