import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import path from 'node:path'

import {
  ASSET_CLASSIFICATION,
  ASSET_TYPE,
  RECORD_TYPE_CATEGORY,
  REIMBURSABLE,
} from '../src/constants'
import { schema } from '../src/db'
import {
  appendMessages,
  createAsset,
  createBook,
  createQuickTemplate,
  createRecord,
  createTag,
  createThread,
  getAllTags,
  getAllTypes,
  getAssetsByBook,
  getBookById,
  getImageCountsByBook,
  getRecordRelationsByBook,
  getRecordListByBook,
  getRecordTagsByBook,
  getRecordsByBook,
  getThreadDetail,
  listQuickTemplates,
  listThreads,
} from '../src/services'
import {
  applyBookSnapshot,
  applyLibrarySnapshot,
  buildBookSnapshot,
  buildLibrarySnapshot,
} from '../src/services/snapshot-service'
import type { Database as AppDatabase } from '../src/types'

const MIGRATIONS_FOLDER = path.resolve(__dirname, '../drizzle')
const MESSAGE_JSON = JSON.stringify({
  id: 'user-1',
  role: 'user',
  parts: [{ type: 'text', text: '本月餐饮支出多少？' }],
})

function createTestDatabase(): AppDatabase {
  const connection = new Database(':memory:')
  const db = drizzle(connection, { schema })
  migrate(db, { migrationsFolder: MIGRATIONS_FOLDER })
  const patched = db as unknown as {
    transaction: (fn: (tx: unknown) => Promise<unknown>) => Promise<unknown>
  }
  patched.transaction = fn => fn(db)
  return db as unknown as AppDatabase
}

function typeSignature(types: Awaited<ReturnType<typeof getAllTypes>>): string[] {
  const names = new Map(types.map(type => [type.id, type.name]))
  return types
    .map(type => {
      const parent = type.parentId === 0 ? '' : names.get(type.parentId) ?? '?'
      return `${type.typeCategory}|${type.isSystem}|${type.specialBehavior}|${parent}>${type.name}`
    })
    .sort()
}

async function seedSourceBook(db: AppDatabase) {
  const book = await createBook(db, {
    name: '家庭账本',
    description: '家庭日常收支',
    background: 'file:///docs/cover.jpg',
  })
  const types = await getAllTypes(db, book.id)
  const expenseType = types.find(
    type => type.typeCategory === RECORD_TYPE_CATEGORY.expense && type.parentId === 0
  )
  const incomeType = types.find(
    type => type.typeCategory === RECORD_TYPE_CATEGORY.income && type.parentId === 0
  )
  if (!expenseType || !incomeType) {
    throw new Error('missing seeded record types')
  }

  const asset = await createAsset(db, {
    booksId: book.id,
    name: '招商银行储蓄卡',
    balance: 100_000,
    type: ASSET_TYPE.capitalAccount,
    classification: ASSET_CLASSIFICATION.debitCard,
    openBank: '招商银行',
    cardNo: '6225880000000000',
  })
  const tag = await createTag(db, {
    booksId: book.id,
    name: '旅行',
    icon: 'Airplane',
  })

  const expense = await createRecord(db, {
    typeId: expenseType.id,
    assetId: asset.id,
    booksId: book.id,
    amount: 10_000,
    charge: 100,
    remark: '晚餐',
    reimbursable: REIMBURSABLE.notReimbursable,
    recordTime: Date.UTC(2026, 9, 30, 12, 0),
    tagIds: [tag.id],
    imagePaths: ['file:///docs/receipt.jpg'],
  })
  const income = await createRecord(db, {
    typeId: incomeType.id,
    assetId: asset.id,
    booksId: book.id,
    amount: 5_000,
    charge: 0,
    remark: '红包',
    reimbursable: REIMBURSABLE.notReimbursable,
    recordTime: Date.UTC(2026, 9, 30, 13, 0),
  })
  await db.insert(schema.recordWithRecord).values({
    recordId: income.id,
    relatedRecordId: expense.id,
  })

  const template = await createQuickTemplate(db, {
    booksId: book.id,
    name: '午餐',
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    typeId: expenseType.id,
    amount: 2_500,
    assetId: asset.id,
    tagIds: [tag.id],
    icon: 'ForkKnife',
  })

  const providers = await db
    .insert(schema.agentProviders)
    .values({
      descriptorId: 'openai-compatible',
      name: '本地测试',
      baseUrl: 'http://localhost:11434',
      models: '[]',
    })
    .returning()
  const provider = providers[0]
  if (!provider) throw new Error('failed to create provider')
  const thread = await createThread(db, book.id, {
    providerId: provider.id,
    modelId: '',
  })
  await appendMessages(db, thread.id, [
    { role: 'user', message: MESSAGE_JSON },
  ])

  return { book, expenseType, incomeType, asset, tag, expense, income, template, thread }
}

describe('transfer-service', () => {
  it('returns joined list fields only for records in the requested range', async () => {
    const db = createTestDatabase()
    const { book, expenseType, asset, tag, expense } = await seedSourceBook(db)

    const rows = await getRecordListByBook(db, book.id, {
      startTime: Date.UTC(2026, 9, 30, 12),
      endTime: Date.UTC(2026, 9, 30, 12, 30),
    })

    expect(rows).toEqual([
      expect.objectContaining({
        record: expect.objectContaining({
          id: expense.id,
        }),
        category: RECORD_TYPE_CATEGORY.expense,
        typeName: expenseType.name,
        iconValue: expenseType.icon,
        assetName: asset.name,
        tags: [expect.objectContaining({ id: tag.id, name: tag.name })],
      }),
    ])
    expect(rows[0]).not.toHaveProperty('imagePaths')
    expect(rows[0]).not.toHaveProperty('relatedRecordIds')
    expect(rows[0]?.record).not.toHaveProperty('remark')
  })

  it('returns both asset names for transfer records', async () => {
    const db = createTestDatabase()
    const { book, asset } = await seedSourceBook(db)
    const types = await getAllTypes(db, book.id)
    const transferType = types.find(
      type => type.typeCategory === RECORD_TYPE_CATEGORY.transfer && type.parentId === 0,
    )
    if (!transferType) throw new Error('missing seeded transfer type')

    const intoAsset = await createAsset(db, {
      booksId: book.id,
      name: '现金账户',
      balance: 0,
      type: ASSET_TYPE.capitalAccount,
      classification: ASSET_CLASSIFICATION.cash,
    })
    const transfer = await createRecord(db, {
      typeId: transferType.id,
      assetId: asset.id,
      intoAssetId: intoAsset.id,
      booksId: book.id,
      amount: 2_000,
      recordTime: Date.UTC(2026, 9, 30, 14, 0),
    })

    const rows = await getRecordListByBook(db, book.id, {
      startTime: Date.UTC(2026, 9, 30, 13, 30),
      endTime: Date.UTC(2026, 9, 30, 14, 30),
    })

    expect(rows).toEqual([
      expect.objectContaining({
        record: { id: transfer.id },
        category: RECORD_TYPE_CATEGORY.transfer,
        assetName: asset.name,
        intoAssetName: intoAsset.name,
      }),
    ])
  })

  it('returns only types used by records in the requested time range', async () => {
    const db = createTestDatabase()
    const { book, expenseType, incomeType, tag } = await seedSourceBook(db)

    const range = {
      startTime: Date.UTC(2026, 9, 30, 12),
      endTime: Date.UTC(2026, 9, 30, 12, 30),
    }
    const types = await getAllTypes(db, book.id, range)
    const records = await getRecordsByBook(db, book.id, range)
    const tags = await getAllTags(db, book.id, range)
    const imageCounts = await getImageCountsByBook(db, book.id, range)
    const recordTags = await getRecordTagsByBook(db, book.id, range)
    const relations = await getRecordRelationsByBook(db, book.id, range)

    expect(types.map(type => type.id)).toContain(expenseType.id)
    expect(types.map(type => type.id)).not.toContain(incomeType.id)
    expect(records).toHaveLength(1)
    expect(tags.map(row => row.id)).toEqual([tag.id])
    expect(imageCounts).toHaveLength(1)
    expect(recordTags).toHaveLength(1)
    expect(relations).toHaveLength(0)
  })

  it('exports and imports a complete book snapshot with remapped ids', async () => {
    const sourceDb = createTestDatabase()
    const targetDb = createTestDatabase()
    const source = await seedSourceBook(sourceDb)

    const snapshot = await buildBookSnapshot(sourceDb, source.book.id, {
      includeAgent: true,
    })

    expect(snapshot.book.name).toBe('家庭账本')
    expect(snapshot.records).toHaveLength(2)
    expect(snapshot.types.length).toBeGreaterThan(10)
    expect(snapshot.quickTemplates[0]?.tagIds).toEqual([source.tag.id])
    expect(snapshot.agentThreads).toHaveLength(1)
    expect(snapshot.agentMessages).toHaveLength(1)

    await createBook(targetDb, { name: '家庭账本' })
    const result = await applyBookSnapshot(targetDb, snapshot)

    const importedBook = await getBookById(targetDb, result.bookId)
    expect(importedBook.name).toBe('家庭账本（导入）')
    expect(importedBook.description).toBe('家庭日常收支')
    expect(importedBook.background).toBe('file:///docs/cover.jpg')
    expect(importedBook.createdTime).toBe(snapshot.book.createdTime)
    expect(importedBook.updatedTime).toBe(snapshot.book.updatedTime)
    expect(result.counts.records).toBe(2)
    expect(result.counts.agentThreads).toBe(1)
    expect(result.counts.agentMessages).toBe(1)

    const importedTypes = await getAllTypes(targetDb, result.bookId)
    expect(importedTypes).toHaveLength(snapshot.types.length)
    expect(typeSignature(importedTypes)).toEqual(typeSignature(snapshot.types))

    const importedAssets = await getAssetsByBook(targetDb, result.bookId)
    expect(importedAssets).toHaveLength(1)
    expect(importedAssets[0]?.balance).toBe(snapshot.assets[0]?.balance)
    expect(importedAssets[0]?.cardNo).toBe('6225880000000000')

    const importedRecords = await getRecordsByBook(targetDb, result.bookId)
    expect(importedRecords).toHaveLength(2)
    const importedExpense = importedRecords.find(record => record.remark === '晚餐')
    const importedIncome = importedRecords.find(record => record.remark === '红包')
    const sourceExpense = snapshot.records.find(record => record.remark === '晚餐')
    if (!importedExpense || !importedIncome || !sourceExpense) {
      throw new Error('missing imported records')
    }
    expect(importedExpense.finalAmount).toBe(sourceExpense.finalAmount)
    expect(importedExpense.charge).toBe(sourceExpense.charge)
    expect(importedExpense.createdTime).toBe(sourceExpense.createdTime)
    expect(importedExpense.updatedTime).toBe(sourceExpense.updatedTime)

    const relationRows = await targetDb.select().from(schema.recordWithRecord).all()
    expect(relationRows).toEqual([
      expect.objectContaining({
        recordId: importedIncome.id,
        relatedRecordId: importedExpense.id,
      }),
    ])

    const importedTags = await getAllTags(targetDb, result.bookId)
    expect(importedTags).toHaveLength(1)
    const tagRelationRows = await targetDb.select().from(schema.tagWithRecord).all()
    expect(tagRelationRows).toEqual([
      expect.objectContaining({
        recordId: importedExpense.id,
        tagId: importedTags[0]?.id,
      }),
    ])

    const imageRows = await targetDb.select().from(schema.imageWithRelated).all()
    expect(imageRows).toEqual([
      expect.objectContaining({
        recordId: importedExpense.id,
        imagePath: 'file:///docs/receipt.jpg',
      }),
    ])

    const importedTemplates = await listQuickTemplates(targetDb, result.bookId)
    expect(importedTemplates).toHaveLength(1)
    expect(importedTemplates[0]?.typeId).toBe(importedExpense.typeId)
    expect(importedTemplates[0]?.assetId).toBe(importedAssets[0]?.id)
    expect(importedTemplates[0]?.tagIds).toEqual([importedTags[0]?.id])

    const importedThreads = await listThreads(targetDb, result.bookId)
    expect(importedThreads).toHaveLength(1)
    expect(importedThreads[0]?.providerId).toBe(0)
    expect(importedThreads[0]?.modelId).toBe('')
    const detail = await getThreadDetail(targetDb, importedThreads[0]!.id)
    expect(detail.messages).toHaveLength(1)
    expect(detail.messages[0]?.message).toBe(MESSAGE_JSON)
  })

  it('omits agent rows when includeAgent is false', async () => {
    const sourceDb = createTestDatabase()
    const targetDb = createTestDatabase()
    const source = await seedSourceBook(sourceDb)

    const snapshot = await buildBookSnapshot(sourceDb, source.book.id, {
      includeAgent: false,
    })

    expect(snapshot.agentThreads).toEqual([])
    expect(snapshot.agentMessages).toEqual([])

    const result = await applyBookSnapshot(targetDb, snapshot)
    expect(result.counts.agentThreads).toBe(0)
    expect(result.counts.agentMessages).toBe(0)
    expect(await listThreads(targetDb, result.bookId)).toEqual([])
  })

  it('exports and imports multiple books atomically', async () => {
    const sourceDb = createTestDatabase()
    const targetDb = createTestDatabase()
    const first = await seedSourceBook(sourceDb)
    const second = await createBook(sourceDb, { name: '旅行账本' })

    const library = await buildLibrarySnapshot(sourceDb, [first.book.id, second.id], {
      includeAgent: false,
    })
    expect(library.books).toHaveLength(2)

    const result = await applyLibrarySnapshot(targetDb, library)
    expect(result.books).toHaveLength(2)
    expect(result.books.map(book => book.name)).toEqual(['家庭账本', '旅行账本'])
    expect(await getBookById(targetDb, result.books[0]!.bookId)).toBeTruthy()
    expect(await getBookById(targetDb, result.books[1]!.bookId)).toBeTruthy()
  })

  it('rolls back the whole import when a reference is invalid', async () => {
    const sourceDb = createTestDatabase()
    const targetDb = createTestDatabase()
    const source = await seedSourceBook(sourceDb)
    const snapshot = await buildBookSnapshot(sourceDb, source.book.id, {
      includeAgent: false,
    })
    const invalid = {
      ...snapshot,
      records: snapshot.records.map((record, index) =>
        index === 0 ? { ...record, typeId: 999_999 } : record
      ),
    }

    await expect(applyBookSnapshot(targetDb, invalid)).rejects.toThrow('类型不存在')
    expect(await targetDb.select().from(schema.books).all()).toEqual([])
  })
})
