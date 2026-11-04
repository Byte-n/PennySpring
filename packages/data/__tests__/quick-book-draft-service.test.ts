import Database from 'better-sqlite3';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'node:path';

import {
  ASSET_CLASSIFICATION,
  ASSET_TYPE,
  RECORD_TYPE_CATEGORY,
  REIMBURSABLE,
  type QuickBookDraftStatusValue,
} from '../src/constants';
import { schema } from '../src/db';
import { quickBookDrafts } from '../src/schema';
import {
  createAsset,
  createBook,
  deleteBook,
  getAllTypes,
  getRecordDetailById,
  getRecordsByBook,
} from '../src/services';
import {
  cleanupQuickBookDrafts,
  confirmQuickBookDraftItem,
  countPendingQuickBookDrafts,
  createQuickBookDraftPlaceholder,
  discardQuickBookDraft,
  getQuickBookDraftById,
  getQuickBookDraftItem,
  listQuickBookDrafts,
  markQuickBookDraftFailed,
  updateQuickBookDraftItems,
} from '../src/services/quick-book-draft-service';
import type {
  DraftItem,
  QuickBookDraftPreset,
} from '../src/services/quick-book-draft-service';
import type { Database as AppDatabase } from '../src/types';

const MIGRATIONS_FOLDER = path.resolve(__dirname, '../drizzle');
const RECORD_TIME = new Date(2026, 10, 4, 12, 0).getTime();
const IMAGE_PATH = 'file:///draft/quick-book-one.jpg';
const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

interface DraftFixture {
  db: AppDatabase;
  connection: InstanceType<typeof Database>;
  booksId: number;
  otherBooksId: number;
  expenseTypeId: number;
  otherBookTypeId: number;
  transferTypeId: number;
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

async function createFixture(): Promise<DraftFixture> {
  const { connection, db } = createTestDatabase();
  const book = await createBook(db, { name: '草稿账本' });
  const otherBook = await createBook(db, { name: '另一账本' });
  const types = await getAllTypes(db, book.id);
  const otherBookTypes = await getAllTypes(db, otherBook.id);
  const expenseType = types.find(
    type =>
      type.typeCategory === RECORD_TYPE_CATEGORY.expense && type.parentId === 0,
  );
  const transferType = types.find(
    type =>
      type.typeCategory === RECORD_TYPE_CATEGORY.transfer &&
      type.parentId === 0,
  );
  const otherBookType = otherBookTypes.find(
    type =>
      type.typeCategory === RECORD_TYPE_CATEGORY.expense && type.parentId === 0,
  );
  if (!expenseType || !transferType || !otherBookType) {
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
    otherBooksId: otherBook.id,
    expenseTypeId: expenseType.id,
    otherBookTypeId: otherBookType.id,
    transferTypeId: transferType.id,
    assetId: asset.id,
  };
}

function preset(overrides: Partial<QuickBookDraftPreset> = {}) {
  return { assetId: 0, typeId: 0, ...overrides };
}

function draftItem(
  fixture: DraftFixture,
  overrides: Partial<DraftItem> = {},
): DraftItem {
  return {
    status: 'pending',
    recordId: 0,
    typeId: fixture.expenseTypeId,
    typeName: '餐饮',
    amountCents: 3_650,
    recordTime: RECORD_TIME,
    remark: '午餐',
    assetId: fixture.assetId,
    assetName: '现金',
    intoAssetId: 0,
    intoAssetName: '',
    chargeCents: 0,
    tagIds: [],
    reimbursable: false,
    warnings: [],
    ...overrides,
  };
}

async function createDraft(
  fixture: DraftFixture,
  id: string,
  items: DraftItem[],
  overrides: {
    booksId?: number;
    imagePath?: string;
    preset?: QuickBookDraftPreset;
  } = {},
) {
  const created = await createQuickBookDraftPlaceholder(fixture.db, {
    id,
    booksId: overrides.booksId ?? fixture.booksId,
    imagePath: overrides.imagePath ?? IMAGE_PATH,
    preset: overrides.preset ?? preset(),
  });
  if (items.length > 0) {
    return updateQuickBookDraftItems(
      fixture.db,
      created.id,
      items,
      overrides.preset ?? preset(),
    );
  }
  return created;
}

async function setDraftTimestamps(
  fixture: DraftFixture,
  id: string,
  values: { updatedTime?: number; confirmedAt?: number },
) {
  await fixture.db
    .update(quickBookDrafts)
    .set(values)
    .where(eq(quickBookDrafts.id, id));
}

describe('quick book draft service', () => {
  it('creates a generating placeholder and reads it back by id', async () => {
    const fixture = await createFixture();

    const created = await createQuickBookDraftPlaceholder(fixture.db, {
      id: 'draft-generating',
      booksId: fixture.booksId,
      imagePath: IMAGE_PATH,
      preset: preset({ assetId: fixture.assetId }),
    });

    expect(created).toMatchObject({
      id: 'draft-generating',
      booksId: fixture.booksId,
      status: 'generating',
      source: 'floating_capture',
      imagePath: IMAGE_PATH,
      items: [],
      preset: { assetId: fixture.assetId, typeId: 0 },
      confirmedCount: 0,
      recordIds: [],
      errorText: '',
      confirmedAt: 0,
    });
    await expect(
      getQuickBookDraftById(fixture.db, 'draft-generating'),
    ).resolves.toEqual(created);
  });

  it('lists drafts by status, books and newest update first', async () => {
    const fixture = await createFixture();
    const now = Date.now();
    const first = await createDraft(fixture, 'draft-first', [
      draftItem(fixture),
    ]);
    const second = await createDraft(fixture, 'draft-second', []);
    const third = await createDraft(fixture, 'draft-third', [], {
      booksId: fixture.otherBooksId,
      imagePath: 'file:///draft/other.jpg',
    });
    await setDraftTimestamps(fixture, first.id, { updatedTime: now - 1_000 });
    await setDraftTimestamps(fixture, second.id, { updatedTime: now - 2_000 });
    await setDraftTimestamps(fixture, third.id, { updatedTime: now - 3_000 });

    const all = await listQuickBookDrafts(fixture.db);

    expect(all.map(row => row.id)).toEqual([
      'draft-first',
      'draft-second',
      'draft-third',
    ]);
    expect(
      (await listQuickBookDrafts(fixture.db, { statuses: ['pending'] })).map(
        row => row.id,
      ),
    ).toEqual(['draft-first']);
    expect(
      (
        await listQuickBookDrafts(fixture.db, { booksId: fixture.otherBooksId })
      ).map(row => row.id),
    ).toEqual(['draft-third']);
  });

  it('excludes confirmed and discarded drafts from the default list', async () => {
    const fixture = await createFixture();
    const confirmed = await createDraft(fixture, 'draft-confirmed', [
      draftItem(fixture),
    ]);
    await confirmQuickBookDraftItem(fixture.db, confirmed.id, 0);
    const discarded = await createDraft(fixture, 'draft-discarded', []);
    await discardQuickBookDraft(fixture.db, discarded.id);

    const defaultRows = await listQuickBookDrafts(fixture.db);

    expect(defaultRows.map(row => row.id)).toEqual([]);
    expect(
      (
        await listQuickBookDrafts(fixture.db, {
          statuses: ['confirmed', 'discarded'],
        })
      )
        .map(row => row.id)
        .sort(),
    ).toEqual(['draft-confirmed', 'draft-discarded']);
  });

  it('counts only pending and failed drafts as pending work', async () => {
    const fixture = await createFixture();
    const generating = await createDraft(fixture, 'draft-generating', []);
    await createDraft(fixture, 'draft-pending', [draftItem(fixture)]);
    const failed = await createDraft(fixture, 'draft-failed', []);
    await markQuickBookDraftFailed(fixture.db, failed.id, '模型调用失败');
    const confirmed = await createDraft(fixture, 'draft-confirmed', [
      draftItem(fixture),
    ]);
    await confirmQuickBookDraftItem(fixture.db, confirmed.id, 0);
    const discarded = await createDraft(fixture, 'draft-discarded', []);
    await discardQuickBookDraft(fixture.db, discarded.id);

    await expect(countPendingQuickBookDrafts(fixture.db)).resolves.toBe(2);
    await expect(
      getQuickBookDraftById(fixture.db, generating.id),
    ).resolves.toMatchObject({ status: 'generating' });
  });

  it('stores draft items and preset while switching generating to pending', async () => {
    const fixture = await createFixture();
    const created = await createDraft(fixture, 'draft-items', []);
    const items = [
      draftItem(fixture, { remark: '早餐', amountCents: 1_200 }),
      draftItem(fixture, {
        remark: '午餐',
        amountCents: null,
        warnings: ['金额待确认'],
      }),
    ];
    const nextPreset = preset({
      assetId: fixture.assetId,
      typeId: fixture.expenseTypeId,
    });

    const updated = await updateQuickBookDraftItems(
      fixture.db,
      created.id,
      items,
      nextPreset,
    );

    expect(updated.status).toBe('pending');
    expect(updated.items).toEqual(items);
    expect(updated.preset).toEqual(nextPreset);
    await expect(
      getQuickBookDraftItem(fixture.db, created.id, 1),
    ).resolves.toEqual(items[1]);
  });

  it('persists optional agent metadata through updateItems', async () => {
    const fixture = await createFixture();
    const created = await createQuickBookDraftPlaceholder(fixture.db, {
      id: 'draft-agent-meta',
      booksId: fixture.booksId,
      imagePath: IMAGE_PATH,
      agentProviderId: 7,
      agentModelId: 'vision-model',
    });
    const items = [draftItem(fixture, { remark: '午餐' })];

    const updated = await updateQuickBookDraftItems(
      fixture.db,
      created.id,
      items,
      preset(),
      { agentSummary: '识别到一笔午餐' },
    );

    expect(updated).toMatchObject({
      status: 'pending',
      agentProviderId: 7,
      agentModelId: 'vision-model',
      agentSummary: '识别到一笔午餐',
    });
    expect(updated.items).toEqual(items);
  });

  it('writes all supplied agent metadata fields', async () => {
    const fixture = await createFixture();
    const created = await createDraft(fixture, 'draft-agent-meta-partial', [
      draftItem(fixture),
    ]);

    const updated = await updateQuickBookDraftItems(
      fixture.db,
      created.id,
      [draftItem(fixture)],
      preset(),
      { agentProviderId: 3, agentModelId: 'text-model', agentSummary: '摘要' },
    );

    expect(updated).toMatchObject({
      agentProviderId: 3,
      agentModelId: 'text-model',
      agentSummary: '摘要',
    });
  });

  it('keeps the error text when marking a draft failed', async () => {
    const fixture = await createFixture();
    const created = await createDraft(fixture, 'draft-failed', []);

    await markQuickBookDraftFailed(fixture.db, created.id, '无法读取截图内容');

    await expect(
      getQuickBookDraftById(fixture.db, created.id),
    ).resolves.toMatchObject({
      status: 'failed',
      errorText: '无法读取截图内容',
    });
  });

  it('rejects out-of-range draft item indexes with a Chinese error', async () => {
    const fixture = await createFixture();
    const created = await createDraft(fixture, 'draft-index', [
      draftItem(fixture),
    ]);

    await expect(
      getQuickBookDraftItem(fixture.db, created.id, 1),
    ).rejects.toThrow('草稿笔数不存在: 1');
    await expect(
      getQuickBookDraftItem(fixture.db, created.id, -1),
    ).rejects.toThrow('草稿笔数不存在: -1');
  });

  it('rejects unknown draft statuses with a Chinese error', async () => {
    const fixture = await createFixture();

    await expect(
      listQuickBookDrafts(fixture.db, {
        statuses: ['bogus' as QuickBookDraftStatusValue],
      }),
    ).rejects.toThrow('草稿状态非法: bogus');
  });

  it('confirms a complete draft item and writes a record with draft fields', async () => {
    const fixture = await createFixture();
    const created = await createDraft(fixture, 'draft-complete', [
      draftItem(fixture, { remark: '晚餐', amountCents: 5_600 }),
    ]);

    const result = await confirmQuickBookDraftItem(fixture.db, created.id, 0);

    expect(result.item).toMatchObject({ status: 'confirmed' });
    expect(result.recordId).toBeGreaterThan(0);
    const records = await getRecordsByBook(fixture.db, fixture.booksId);
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      id: result.recordId,
      typeId: fixture.expenseTypeId,
      assetId: fixture.assetId,
      amount: 5_600,
      remark: '晚餐',
      recordTime: RECORD_TIME,
      reimbursable: REIMBURSABLE.notReimbursable,
    });
    const detail = await getRecordDetailById(
      fixture.db,
      result.recordId,
      fixture.booksId,
    );
    expect(detail.imagePaths).toEqual([IMAGE_PATH]);
    const draft = await getQuickBookDraftById(fixture.db, created.id);
    expect(draft).toMatchObject({
      status: 'confirmed',
      confirmedCount: 1,
      recordIds: [result.recordId],
    });
    expect(draft.confirmedAt).toBeGreaterThan(0);
  });

  it('accepts caller input and lets it override or cancel the image attachment', async () => {
    const fixture = await createFixture();
    const created = await createDraft(fixture, 'draft-input', [
      draftItem(fixture, { remark: '原备注' }),
    ]);

    const result = await confirmQuickBookDraftItem(fixture.db, created.id, 0, {
      typeId: fixture.expenseTypeId,
      booksId: fixture.booksId,
      amount: 9_900,
      remark: '修改后备注',
      recordTime: RECORD_TIME + 1_000,
      reimbursable: REIMBURSABLE.reimbursable,
      assetId: fixture.assetId,
      imagePaths: [],
    });

    const records = await getRecordsByBook(fixture.db, fixture.booksId);
    expect(records[0]).toMatchObject({
      id: result.recordId,
      amount: 9_900,
      remark: '修改后备注',
      recordTime: RECORD_TIME + 1_000,
      reimbursable: REIMBURSABLE.reimbursable,
    });
    const detail = await getRecordDetailById(
      fixture.db,
      result.recordId,
      fixture.booksId,
    );
    expect(detail.imagePaths).toEqual([]);
  });

  it('rolls back and keeps the item pending when fields are missing or invalid', async () => {
    const fixture = await createFixture();
    const cases: Array<{ label: string; item: DraftItem; message: string }> = [
      {
        label: 'missing type',
        item: draftItem(fixture, { typeId: 0 }),
        message: '请选择记账类型',
      },
      {
        label: 'foreign type',
        item: draftItem(fixture, { typeId: fixture.otherBookTypeId }),
        message: '记账类型不属于目标账本',
      },
      {
        label: 'missing amount',
        item: draftItem(fixture, { amountCents: null }),
        message: '金额必须大于 0',
      },
      {
        label: 'zero amount',
        item: draftItem(fixture, { amountCents: 0 }),
        message: '金额必须大于 0',
      },
      {
        label: 'transfer without source asset',
        item: draftItem(fixture, {
          typeId: fixture.transferTypeId,
          assetId: 0,
          intoAssetId: fixture.assetId,
        }),
        message: '转账必须选择转出资产',
      },
      {
        label: 'transfer without destination asset',
        item: draftItem(fixture, {
          typeId: fixture.transferTypeId,
          assetId: fixture.assetId,
          intoAssetId: 0,
        }),
        message: '转账必须选择转入资产',
      },
      {
        label: 'transfer with identical assets',
        item: draftItem(fixture, {
          typeId: fixture.transferTypeId,
          assetId: fixture.assetId,
          intoAssetId: fixture.assetId,
        }),
        message: '转账转出与转入资产不能相同',
      },
    ];

    for (const testCase of cases) {
      const draft = await createDraft(fixture, `draft-${testCase.label}`, [
        testCase.item,
      ]);

      await expect(
        confirmQuickBookDraftItem(fixture.db, draft.id, 0),
      ).rejects.toThrow(testCase.message);
      await expect(
        getQuickBookDraftById(fixture.db, draft.id),
      ).resolves.toMatchObject({ status: 'pending' });
      await expect(
        getQuickBookDraftItem(fixture.db, draft.id, 0),
      ).resolves.toMatchObject({ status: 'pending', recordId: 0 });
    }
    expect(await getRecordsByBook(fixture.db, fixture.booksId)).toEqual([]);
  });

  it('returns the existing record id when confirming the same item twice', async () => {
    const fixture = await createFixture();
    const created = await createDraft(fixture, 'draft-idempotent', [
      draftItem(fixture, { remark: '第一笔' }),
      draftItem(fixture, { remark: '第二笔' }),
    ]);

    const first = await confirmQuickBookDraftItem(fixture.db, created.id, 0);
    const second = await confirmQuickBookDraftItem(fixture.db, created.id, 0);

    expect(second.recordId).toBe(first.recordId);
    expect(await getRecordsByBook(fixture.db, fixture.booksId)).toHaveLength(1);
    await expect(
      getQuickBookDraftById(fixture.db, created.id),
    ).resolves.toMatchObject({ status: 'pending', confirmedCount: 1 });
  });

  it('tracks partial confirmation and closes the draft after the last item', async () => {
    const fixture = await createFixture();
    const created = await createDraft(fixture, 'draft-progress', [
      draftItem(fixture, { remark: '第一笔', amountCents: 1_000 }),
      draftItem(fixture, { remark: '第二笔', amountCents: 2_000 }),
    ]);

    await confirmQuickBookDraftItem(fixture.db, created.id, 0);
    const partial = await getQuickBookDraftById(fixture.db, created.id);
    expect(partial).toMatchObject({
      status: 'pending',
      confirmedCount: 1,
      confirmedAt: 0,
    });
    expect(partial.recordIds).toHaveLength(1);

    const last = await confirmQuickBookDraftItem(fixture.db, created.id, 1);
    const completed = await getQuickBookDraftById(fixture.db, created.id);
    expect(completed).toMatchObject({
      status: 'confirmed',
      confirmedCount: 2,
      recordIds: [partial.recordIds[0], last.recordId],
    });
    expect(completed.confirmedAt).toBeGreaterThan(0);
  });

  it('rejects confirmation for discarded drafts', async () => {
    const fixture = await createFixture();
    const created = await createDraft(fixture, 'draft-discard-confirm', [
      draftItem(fixture),
    ]);
    const discardedPaths = await discardQuickBookDraft(fixture.db, created.id);

    expect(discardedPaths).toEqual([IMAGE_PATH]);
    await expect(
      confirmQuickBookDraftItem(fixture.db, created.id, 0),
    ).rejects.toThrow('草稿已丢弃，无法确认');
    expect(await getRecordsByBook(fixture.db, fixture.booksId)).toEqual([]);
    await expect(
      discardQuickBookDraft(fixture.db, created.id),
    ).resolves.toEqual([]);
  });

  it('returns the existing record id when confirming an already confirmed draft', async () => {
    const fixture = await createFixture();
    const created = await createDraft(fixture, 'draft-confirmed-again', [
      draftItem(fixture),
    ]);
    const first = await confirmQuickBookDraftItem(fixture.db, created.id, 0);

    const second = await confirmQuickBookDraftItem(fixture.db, created.id, 0);

    expect(second.recordId).toBe(first.recordId);
    expect(await getRecordsByBook(fixture.db, fixture.booksId)).toHaveLength(1);
  });

  it('fails confirmation without creating records when the target book is gone', async () => {
    const fixture = await createFixture();
    const otherBookTypes = await getAllTypes(fixture.db, fixture.otherBooksId);
    const otherBookExpenseType = otherBookTypes.find(
      type =>
        type.typeCategory === RECORD_TYPE_CATEGORY.expense &&
        type.parentId === 0,
    );
    if (!otherBookExpenseType) throw new Error('missing other book type');
    const created = await createDraft(
      fixture,
      'draft-missing-book',
      [draftItem(fixture, { typeId: otherBookExpenseType.id, assetId: 0 })],
      { booksId: fixture.otherBooksId },
    );
    await deleteBook(fixture.db, fixture.otherBooksId);

    await expect(
      confirmQuickBookDraftItem(fixture.db, created.id, 0),
    ).rejects.toThrow(`账本不存在: ${fixture.otherBooksId}`);
    expect(await getRecordsByBook(fixture.db, fixture.otherBooksId)).toEqual(
      [],
    );
    await expect(
      getQuickBookDraftById(fixture.db, created.id),
    ).resolves.toMatchObject({ status: 'pending', confirmedCount: 0 });
  });

  it('cleans stale generating drafts and expired finished drafts', async () => {
    const fixture = await createFixture();
    const now = Date.now();
    const staleGenerating = await createDraft(fixture, 'draft-stale', []);
    await setDraftTimestamps(fixture, staleGenerating.id, {
      updatedTime: now - 6 * MINUTE,
    });
    const freshGenerating = await createDraft(fixture, 'draft-fresh', []);
    await setDraftTimestamps(fixture, freshGenerating.id, {
      updatedTime: now - 1 * MINUTE,
    });

    const expiredDiscarded = await createDraft(
      fixture,
      'draft-old-discard',
      [],
      { imagePath: 'file:///draft/quick-book-old-discard.jpg' },
    );
    await discardQuickBookDraft(fixture.db, expiredDiscarded.id);
    await setDraftTimestamps(fixture, expiredDiscarded.id, {
      updatedTime: now - 8 * DAY,
    });
    const recentDiscarded = await createDraft(fixture, 'draft-new-discard', []);
    await discardQuickBookDraft(fixture.db, recentDiscarded.id);
    await setDraftTimestamps(fixture, recentDiscarded.id, {
      updatedTime: now - 1 * DAY,
    });

    const expiredConfirmed = await createDraft(
      fixture,
      'draft-old-confirm',
      [draftItem(fixture)],
      { imagePath: 'file:///draft/quick-book-old-confirm.jpg' },
    );
    await confirmQuickBookDraftItem(fixture.db, expiredConfirmed.id, 0);
    await setDraftTimestamps(fixture, expiredConfirmed.id, {
      confirmedAt: now - 31 * DAY,
    });
    const recentConfirmed = await createDraft(fixture, 'draft-new-confirm', [
      draftItem(fixture),
    ]);
    await confirmQuickBookDraftItem(fixture.db, recentConfirmed.id, 0);

    const deletedPaths = await cleanupQuickBookDrafts(fixture.db);

    expect(deletedPaths.sort()).toEqual(
      [
        'file:///draft/quick-book-old-discard.jpg',
        'file:///draft/quick-book-old-confirm.jpg',
      ].sort(),
    );
    await expect(
      getQuickBookDraftById(fixture.db, staleGenerating.id),
    ).resolves.toMatchObject({ status: 'failed' });
    await expect(
      getQuickBookDraftById(fixture.db, freshGenerating.id),
    ).resolves.toMatchObject({ status: 'generating' });
    await expect(
      getQuickBookDraftById(fixture.db, expiredDiscarded.id),
    ).rejects.toThrow('草稿不存在');
    await expect(
      getQuickBookDraftById(fixture.db, expiredConfirmed.id),
    ).rejects.toThrow('草稿不存在');
    await expect(
      getQuickBookDraftById(fixture.db, recentDiscarded.id),
    ).resolves.toMatchObject({ status: 'discarded' });
    await expect(
      getQuickBookDraftById(fixture.db, recentConfirmed.id),
    ).resolves.toMatchObject({ status: 'confirmed' });
  });

  it('keeps the draft image while only part of the items are confirmed', async () => {
    const fixture = await createFixture();
    const created = await createDraft(fixture, 'draft-partial-cleanup', [
      draftItem(fixture, { remark: '第一笔' }),
      draftItem(fixture, { remark: '第二笔' }),
    ]);
    await confirmQuickBookDraftItem(fixture.db, created.id, 0);

    const deletedPaths = await cleanupQuickBookDrafts(fixture.db);

    expect(deletedPaths).toEqual([]);
    const draft = await getQuickBookDraftById(fixture.db, created.id);
    expect(draft).toMatchObject({
      status: 'pending',
      imagePath: IMAGE_PATH,
      confirmedCount: 1,
    });
  });

  it('marks drafts failed when the target book no longer exists', async () => {
    const fixture = await createFixture();
    const created = await createDraft(
      fixture,
      'draft-missing-book',
      [draftItem(fixture, { typeId: fixture.otherBookTypeId })],
      { booksId: fixture.otherBooksId },
    );
    await deleteBook(fixture.db, fixture.otherBooksId);

    await cleanupQuickBookDrafts(fixture.db);

    await expect(
      getQuickBookDraftById(fixture.db, created.id),
    ).resolves.toMatchObject({
      status: 'failed',
      errorText: '目标账本已不存在',
    });
  });
});
