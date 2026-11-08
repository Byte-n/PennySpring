import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'node:path';

import {
  ASSET_CLASSIFICATION,
  ASSET_TYPE,
  RECORD_TYPE_CATEGORY,
  REIMBURSABLE,
} from '../src/constants';
import { schema } from '../src/db';
import {
  createAsset,
  createBook,
  createRecord,
  createRecords,
  deleteRecords,
  getAllTypes,
  getAssetsByBook,
  getRecordsByBook,
  updateRecords,
} from '../src/services';
import type { Database as AppDatabase } from '../src/types';

const MIGRATIONS_FOLDER = path.resolve(__dirname, '../drizzle');
const RECORD_TIME = new Date(2026, 9, 30, 12, 0).getTime();

interface BatchFixture {
  db: AppDatabase;
  connection: InstanceType<typeof Database>;
  booksId: number;
  expenseTypeId: number;
  incomeTypeId: number;
  assetId: number;
}

function createTestDatabase(): {
  connection: InstanceType<typeof Database>;
  db: AppDatabase;
} {
  const connection = new Database(':memory:');
  const db = drizzle(connection, { schema });
  migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  const patched = db as unknown as {
    transaction: <T>(fn: (tx: unknown) => Promise<T>) => Promise<T>;
  };
  patched.transaction = async fn => {
    connection.exec('BEGIN');
    try {
      const result = await fn(db);
      connection.exec('COMMIT');
      return result;
    } catch (error) {
      connection.exec('ROLLBACK');
      throw error;
    }
  };
  return { connection, db: db as unknown as AppDatabase };
}

async function createFixture(): Promise<BatchFixture> {
  const { connection, db } = createTestDatabase();
  const book = await createBook(db, { name: '批量账本' });
  const types = await getAllTypes(db, book.id);
  const expenseType = types.find(
    type =>
      type.typeCategory === RECORD_TYPE_CATEGORY.expense && type.parentId === 0,
  );
  const incomeType = types.find(
    type =>
      type.typeCategory === RECORD_TYPE_CATEGORY.income && type.parentId === 0,
  );
  if (!expenseType || !incomeType) {
    throw new Error('missing seeded record types');
  }
  const asset = await createAsset(db, {
    booksId: book.id,
    name: '现金',
    balance: 100_000,
    type: ASSET_TYPE.capitalAccount,
    classification: ASSET_CLASSIFICATION.cash,
  });
  return {
    db,
    connection,
    booksId: book.id,
    expenseTypeId: expenseType.id,
    incomeTypeId: incomeType.id,
    assetId: asset.id,
  };
}

function expenseInput(
  fixture: BatchFixture,
  amount: number,
  remark: string,
): Parameters<typeof createRecord>[1] {
  return {
    typeId: fixture.expenseTypeId,
    assetId: fixture.assetId,
    booksId: fixture.booksId,
    amount,
    remark,
    reimbursable: REIMBURSABLE.notReimbursable,
    recordTime: RECORD_TIME,
  };
}

describe('record client mutation idempotency', () => {
  it('returns the existing record when the same mutation id is created twice', async () => {
    const fixture = await createFixture();
    const input = {
      ...expenseInput(fixture, 1200, '幂等记录'),
      clientMutationId: 'draft-1:0',
    };

    const first = await createRecord(fixture.db, input);
    const second = await createRecord(fixture.db, input);

    expect(second.id).toBe(first.id);
    expect(await getRecordsByBook(fixture.db, fixture.booksId)).toHaveLength(1);
  });

  it('creates separate records when mutation ids differ or are empty', async () => {
    const fixture = await createFixture();

    await createRecord(fixture.db, {
      ...expenseInput(fixture, 100, '第一次'),
      clientMutationId: 'draft-1:0',
    });
    await createRecord(fixture.db, {
      ...expenseInput(fixture, 200, '第二次'),
      clientMutationId: 'draft-1:1',
    });
    await createRecord(fixture.db, {
      ...expenseInput(fixture, 300, '无幂等键一'),
    });
    await createRecord(fixture.db, {
      ...expenseInput(fixture, 400, '无幂等键二'),
    });

    expect(await getRecordsByBook(fixture.db, fixture.booksId)).toHaveLength(4);
  });
});

function updateInput(
  fixture: BatchFixture,
  id: number,
  amount: number,
): Parameters<typeof updateRecords>[1][number] {
  return {
    id,
    typeId: fixture.expenseTypeId,
    assetId: fixture.assetId,
    booksId: fixture.booksId,
    amount,
    reimbursable: REIMBURSABLE.notReimbursable,
    recordTime: RECORD_TIME,
  };
}

describe('record batch services', () => {
  it('creates all records in one transaction and applies every balance change', async () => {
    const fixture = await createFixture();

    const rows = await createRecords(fixture.db, [
      expenseInput(fixture, 1_000, '早餐'),
      expenseInput(fixture, 2_000, '午餐'),
    ]);

    expect(rows.map(row => row.remark)).toEqual(['早餐', '午餐']);
    expect(await getRecordsByBook(fixture.db, fixture.booksId)).toHaveLength(2);
    const [asset] = await getAssetsByBook(fixture.db, fixture.booksId);
    expect(asset?.balance).toBe(97_000);
  });

  it('rolls back every created record when a later item fails', async () => {
    const fixture = await createFixture();

    await expect(
      createRecords(fixture.db, [
        expenseInput(fixture, 1_000, '早餐'),
        {
          ...expenseInput(fixture, 2_000, '午餐'),
          typeId: 999_999,
        },
      ]),
    ).rejects.toThrow('Type not found: 999999');

    expect(await getRecordsByBook(fixture.db, fixture.booksId)).toEqual([]);
    const [asset] = await getAssetsByBook(fixture.db, fixture.booksId);
    expect(asset?.balance).toBe(100_000);
  });

  it('updates all records in one transaction', async () => {
    const fixture = await createFixture();
    const [first, second] = await createRecords(fixture.db, [
      expenseInput(fixture, 1_000, '早餐'),
      expenseInput(fixture, 2_000, '午餐'),
    ]);
    if (!first || !second) throw new Error('missing created records');

    const rows = await updateRecords(fixture.db, [
      updateInput(fixture, first.id, 1_500),
      updateInput(fixture, second.id, 2_500),
    ]);

    expect(rows.map(row => row.amount)).toEqual([1_500, 2_500]);
    const records = await getRecordsByBook(fixture.db, fixture.booksId);
    expect(records.map(record => record.amount).sort()).toEqual([1_500, 2_500]);
    const [asset] = await getAssetsByBook(fixture.db, fixture.booksId);
    expect(asset?.balance).toBe(96_000);
  });

  it('rolls back every update when a later item fails', async () => {
    const fixture = await createFixture();
    const [first] = await createRecords(fixture.db, [
      expenseInput(fixture, 1_000, '早餐'),
    ]);
    if (!first) throw new Error('missing created record');

    await expect(
      updateRecords(fixture.db, [
        updateInput(fixture, first.id, 1_500),
        updateInput(fixture, 999_999, 2_500),
      ]),
    ).rejects.toThrow('Record not found: 999999');

    const [record] = await getRecordsByBook(fixture.db, fixture.booksId);
    expect(record?.amount).toBe(1_000);
    const [asset] = await getAssetsByBook(fixture.db, fixture.booksId);
    expect(asset?.balance).toBe(99_000);
  });

  it('deletes all records in one transaction and restores balances', async () => {
    const fixture = await createFixture();
    const rows = await createRecords(fixture.db, [
      expenseInput(fixture, 1_000, '早餐'),
      expenseInput(fixture, 2_000, '午餐'),
    ]);

    await deleteRecords(
      fixture.db,
      rows.map(row => row.id),
      fixture.booksId,
    );

    expect(await getRecordsByBook(fixture.db, fixture.booksId)).toEqual([]);
    const [asset] = await getAssetsByBook(fixture.db, fixture.booksId);
    expect(asset?.balance).toBe(100_000);
  });

  it('rolls back every deletion when a later id fails', async () => {
    const fixture = await createFixture();
    const rows = await createRecords(fixture.db, [
      expenseInput(fixture, 1_000, '早餐'),
      expenseInput(fixture, 2_000, '午餐'),
    ]);
    const first = rows[0];
    if (!first) throw new Error('missing created record');

    await expect(
      deleteRecords(fixture.db, [first.id, 999_999], fixture.booksId),
    ).rejects.toThrow('Record not found: 999999');

    expect(await getRecordsByBook(fixture.db, fixture.booksId)).toHaveLength(2);
    const [asset] = await getAssetsByBook(fixture.db, fixture.booksId);
    expect(asset?.balance).toBe(97_000);
  });

  it('rejects duplicate ids in update and delete batches', async () => {
    const fixture = await createFixture();
    const [record] = await createRecords(fixture.db, [
      expenseInput(fixture, 1_000, '早餐'),
    ]);
    if (!record) throw new Error('missing created record');

    await expect(
      updateRecords(fixture.db, [
        updateInput(fixture, record.id, 1_500),
        updateInput(fixture, record.id, 2_500),
      ]),
    ).rejects.toThrow('批量修改包含重复的记录');
    await expect(
      deleteRecords(fixture.db, [record.id, record.id], fixture.booksId),
    ).rejects.toThrow('批量删除包含重复的记录');
  });
});
