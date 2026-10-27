import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

import { schema } from '../src/db';
import { createTag, deleteTag } from '../src/services/tag-service';
import type { Database as CanonicalDatabase } from '../src/types';

interface TestDatabase {
  connection: InstanceType<typeof Database>;
  db: CanonicalDatabase;
}

function createTestDatabase(): TestDatabase {
  const connection = new Database(':memory:');
  connection.exec(`
    CREATE TABLE tb_tag (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      books_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      invisible TEXT NOT NULL DEFAULT 'visible',
      icon TEXT NOT NULL DEFAULT '',
      created_time INTEGER NOT NULL DEFAULT 0,
      updated_time INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE tb_tag_with_record (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      record_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      created_time INTEGER NOT NULL DEFAULT 0,
      updated_time INTEGER NOT NULL DEFAULT 0
    );
  `);

  const syncDb = drizzle(connection, { schema });
  (syncDb as unknown as { transaction: unknown }).transaction = async function <T>(
    fn: (tx: unknown) => Promise<T>,
  ): Promise<T> {
    connection.exec('BEGIN');
    try {
      const result = await fn(syncDb);
      connection.exec('COMMIT');
      return result;
    } catch (error) {
      connection.exec('ROLLBACK');
      throw error;
    }
  };

  return {
    connection,
    db: syncDb as unknown as CanonicalDatabase,
  };
}

describe('deleteTag', () => {
  it('removes tag associations before deleting the tag', async () => {
    const { connection, db } = createTestDatabase();
    const tag = await createTag(db, { booksId: 1, name: '报销' });
    connection
      .prepare('INSERT INTO tb_tag_with_record (record_id, tag_id) VALUES (?, ?)')
      .run(10, tag.id);

    await deleteTag(db, tag.id, 1);

    const remainingTags = connection.prepare('SELECT id FROM tb_tag').all();
    const remainingLinks = connection
      .prepare('SELECT id FROM tb_tag_with_record')
      .all();
    expect(remainingTags).toHaveLength(0);
    expect(remainingLinks).toHaveLength(0);
  });
});
