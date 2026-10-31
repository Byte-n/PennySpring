import { asc, inArray } from 'drizzle-orm'

import { REIMBURSABLE } from '../constants'
import {
  agentMessages,
  agentThreads,
  assets,
  books,
  imageWithRelated,
  quickTemplates,
  records,
  recordWithRecord,
  tagWithRecord,
  tags,
  types,
} from '../schema'
import type { Database } from '../types'
import { getThreadDetail, listThreads } from './agent-service'
import { getAssetsByBook } from './asset-service'
import { getBookById } from './book-service'
import { listQuickTemplates } from './quick-template-service'
import { getRecordsByBook } from './record-service'
import { getAllTags } from './tag-service'
import { getAllTypes } from './type-service'
import type {
  ApplyBookSnapshotResult,
  ApplyLibrarySnapshotResult,
  ApplySnapshotOptions,
  BookSnapshot,
  BuildSnapshotOptions,
  ImageRow,
  LibrarySnapshot,
  RecordRelationRow,
  TagRelationRow,
  Tx,
  TypeRow,
} from './types'

function assertUniqueIds(rows: Array<{ id: number }>, label: string): void {
  const seen = new Set<number>()
  for (const row of rows) {
    if (seen.has(row.id)) {
      throw new Error(`${label}存在重复 ID: ${row.id}`)
    }
    seen.add(row.id)
  }
}

function sortTypesForInsert(typeRows: TypeRow[]): TypeRow[] {
  const byId = new Map(typeRows.map(row => [row.id, row]))
  const state = new Map<number, 'visiting' | 'done'>()
  const result: TypeRow[] = []

  function visit(type: TypeRow): void {
    const current = state.get(type.id)
    if (current === 'done') return
    if (current === 'visiting') {
      throw new Error('类型层级存在循环')
    }
    state.set(type.id, 'visiting')
    if (type.parentId !== 0) {
      const parent = byId.get(type.parentId)
      if (!parent) {
        throw new Error(`类型父级不存在: ${type.parentId}`)
      }
      visit(parent)
    }
    state.set(type.id, 'done')
    result.push(type)
  }

  for (const type of typeRows) {
    visit(type)
  }
  return result
}

function validateSnapshot(snapshot: BookSnapshot): void {
  assertUniqueIds(snapshot.types, '类型')
  assertUniqueIds(snapshot.assets, '资产')
  assertUniqueIds(snapshot.tags, '标签')
  assertUniqueIds(snapshot.records, '记录')
  assertUniqueIds(snapshot.agentThreads, '会话')
  assertUniqueIds(snapshot.agentMessages, '消息')

  const typeIds = new Set(snapshot.types.map(type => type.id))
  const assetIds = new Set(snapshot.assets.map(asset => asset.id))
  const tagIds = new Set(snapshot.tags.map(tag => tag.id))
  const recordIds = new Set(snapshot.records.map(record => record.id))
  const threadIds = new Set(snapshot.agentThreads.map(thread => thread.id))

  for (const type of snapshot.types) {
    if (type.parentId !== 0 && !typeIds.has(type.parentId)) {
      throw new Error(`类型不存在: ${type.parentId}`)
    }
  }

  for (const record of snapshot.records) {
    if (!typeIds.has(record.typeId)) {
      throw new Error(`类型不存在: ${record.typeId}`)
    }
    if (record.assetId !== 0 && !assetIds.has(record.assetId)) {
      throw new Error(`资产不存在: ${record.assetId}`)
    }
    if (record.intoAssetId !== 0 && !assetIds.has(record.intoAssetId)) {
      throw new Error(`资产不存在: ${record.intoAssetId}`)
    }
  }

  for (const relation of snapshot.recordRelations) {
    if (!recordIds.has(relation.recordId)) {
      throw new Error(`记录不存在: ${relation.recordId}`)
    }
    if (!recordIds.has(relation.relatedRecordId)) {
      throw new Error(`记录不存在: ${relation.relatedRecordId}`)
    }
  }

  for (const relation of snapshot.tagRelations) {
    if (!recordIds.has(relation.recordId)) {
      throw new Error(`记录不存在: ${relation.recordId}`)
    }
    if (!tagIds.has(relation.tagId)) {
      throw new Error(`标签不存在: ${relation.tagId}`)
    }
  }

  for (const image of snapshot.images) {
    if (!recordIds.has(image.recordId)) {
      throw new Error(`记录不存在: ${image.recordId}`)
    }
  }

  for (const template of snapshot.quickTemplates) {
    if (!typeIds.has(template.typeId)) {
      throw new Error(`类型不存在: ${template.typeId}`)
    }
    if (template.assetId !== 0 && !assetIds.has(template.assetId)) {
      throw new Error(`资产不存在: ${template.assetId}`)
    }
    if (template.intoAssetId !== 0 && !assetIds.has(template.intoAssetId)) {
      throw new Error(`资产不存在: ${template.intoAssetId}`)
    }
    for (const tagId of template.tagIds) {
      if (tagId !== 0 && !tagIds.has(tagId)) {
        throw new Error(`标签不存在: ${tagId}`)
      }
    }
  }

  for (const message of snapshot.agentMessages) {
    if (!threadIds.has(message.threadId)) {
      throw new Error(`会话不存在: ${message.threadId}`)
    }
  }
}

export async function buildBookSnapshot(
  db: Database,
  booksId: number,
  options: BuildSnapshotOptions = {},
): Promise<BookSnapshot> {
  const book = await getBookById(db, booksId)
  const [typeRows, assetRows, tagRows, recordRows, templateRows] = await Promise.all([
    getAllTypes(db, booksId),
    getAssetsByBook(db, booksId),
    getAllTags(db, booksId),
    getRecordsByBook(db, booksId),
    listQuickTemplates(db, booksId),
  ])

  const recordIds = recordRows.map(record => record.id)
  const [recordRelationRows, tagRelationRows, imageRows] = recordIds.length === 0
    ? [[], [], []] as const
    : await Promise.all([
        db
          .select()
          .from(recordWithRecord)
          .where(inArray(recordWithRecord.recordId, recordIds))
          .orderBy(asc(recordWithRecord.id))
          .all(),
        db
          .select()
          .from(tagWithRecord)
          .where(inArray(tagWithRecord.recordId, recordIds))
          .orderBy(asc(tagWithRecord.id))
          .all(),
        db
          .select()
          .from(imageWithRelated)
          .where(inArray(imageWithRelated.recordId, recordIds))
          .orderBy(asc(imageWithRelated.id))
          .all(),
      ])

  let threadRows: BookSnapshot['agentThreads'] = []
  let messageRows: BookSnapshot['agentMessages'] = []
  if (options.includeAgent === true) {
    threadRows = await listThreads(db, booksId)
    for (const thread of threadRows) {
      const detail = await getThreadDetail(db, thread.id)
      messageRows.push(...detail.messages)
    }
  }

  return {
    book,
    types: typeRows,
    assets: assetRows,
    tags: tagRows,
    records: recordRows,
    recordRelations: recordRelationRows as RecordRelationRow[],
    tagRelations: tagRelationRows as TagRelationRow[],
    images: imageRows as ImageRow[],
    quickTemplates: templateRows,
    agentThreads: threadRows,
    agentMessages: messageRows,
  }
}

export async function buildLibrarySnapshot(
  db: Database,
  booksIds: number[],
  options: BuildSnapshotOptions = {},
): Promise<LibrarySnapshot> {
  if (booksIds.length === 0) {
    throw new Error('至少选择一个账本')
  }
  const uniqueIds = Array.from(new Set(booksIds))
  if (uniqueIds.length !== booksIds.length) {
    throw new Error('账本选择存在重复')
  }

  const snapshotBooks: BookSnapshot[] = []
  for (const booksId of uniqueIds) {
    snapshotBooks.push(await buildBookSnapshot(db, booksId, options))
  }
  return { books: snapshotBooks }
}

async function resolveBookName(tx: Tx, desiredName: string): Promise<string> {
  const base = desiredName.trim() || '导入账本'
  const rows = await tx.select({ name: books.name }).from(books).all()
  const names = new Set(rows.map(row => row.name))
  if (!names.has(base)) return base

  let candidate = `${base}（导入）`
  let index = 2
  while (names.has(candidate)) {
    candidate = `${base}（导入 ${index}）`
    index += 1
  }
  return candidate
}

async function applyBookSnapshotTx(
  tx: Tx,
  snapshot: BookSnapshot,
  options: ApplySnapshotOptions,
): Promise<ApplyBookSnapshotResult> {
  validateSnapshot(snapshot)

  const typeRows = sortTypesForInsert(snapshot.types)
  const name = await resolveBookName(tx, options.bookName ?? snapshot.book.name)
  const insertedBooks = await tx
    .insert(books)
    .values({
      name,
      description: snapshot.book.description,
      background: snapshot.book.background,
      createdTime: snapshot.book.createdTime,
      updatedTime: snapshot.book.updatedTime,
    })
    .returning({ id: books.id })
  const bookId = insertedBooks[0]?.id
  if (!bookId) throw new Error('创建导入账本失败')

  const typeIdMap = new Map<number, number>()
  for (const type of typeRows) {
    const inserted = await tx
      .insert(types)
      .values({
        booksId: bookId,
        parentId: type.parentId === 0 ? 0 : typeIdMap.get(type.parentId) ?? 0,
        name: type.name,
        icon: type.icon,
        typeCategory: type.typeCategory,
        isSystem: type.isSystem,
        specialBehavior: type.specialBehavior,
        sort: type.sort,
        createdTime: type.createdTime,
        updatedTime: type.updatedTime,
      })
      .returning({ id: types.id })
    const newId = inserted[0]?.id
    if (!newId) throw new Error('导入分类失败')
    typeIdMap.set(type.id, newId)
  }

  const assetIdMap = new Map<number, number>()
  for (const asset of snapshot.assets) {
    const inserted = await tx
      .insert(assets)
      .values({
        booksId: bookId,
        name: asset.name,
        balance: asset.balance,
        totalAmount: asset.totalAmount,
        billingDate: asset.billingDate,
        repaymentDate: asset.repaymentDate,
        type: asset.type,
        classification: asset.classification,
        invisible: asset.invisible,
        openBank: asset.openBank,
        cardNo: asset.cardNo,
        remark: asset.remark,
        sort: asset.sort,
        createdTime: asset.createdTime,
        updatedTime: asset.updatedTime,
      })
      .returning({ id: assets.id })
    const newId = inserted[0]?.id
    if (!newId) throw new Error('导入资产失败')
    assetIdMap.set(asset.id, newId)
  }

  const tagIdMap = new Map<number, number>()
  for (const tag of snapshot.tags) {
    const inserted = await tx
      .insert(tags)
      .values({
        booksId: bookId,
        name: tag.name,
        invisible: tag.invisible,
        icon: tag.icon,
        createdTime: tag.createdTime,
        updatedTime: tag.updatedTime,
      })
      .returning({ id: tags.id })
    const newId = inserted[0]?.id
    if (!newId) throw new Error('导入标签失败')
    tagIdMap.set(tag.id, newId)
  }

  const recordIdMap = new Map<number, number>()
  for (const record of snapshot.records) {
    const typeId = typeIdMap.get(record.typeId)
    if (!typeId) throw new Error(`类型不存在: ${record.typeId}`)
    const assetId = record.assetId === 0 ? 0 : assetIdMap.get(record.assetId)
    if (assetId === undefined) throw new Error(`资产不存在: ${record.assetId}`)
    const intoAssetId = record.intoAssetId === 0
      ? 0
      : assetIdMap.get(record.intoAssetId)
    if (intoAssetId === undefined) {
      throw new Error(`资产不存在: ${record.intoAssetId}`)
    }

    const inserted = await tx
      .insert(records)
      .values({
        typeId,
        assetId,
        intoAssetId,
        booksId: bookId,
        amount: record.amount,
        finalAmount: record.finalAmount,
        charge: record.charge,
        remark: record.remark,
        reimbursable: record.reimbursable,
        recordTime: record.recordTime,
        createdTime: record.createdTime,
        updatedTime: record.updatedTime,
      })
      .returning({ id: records.id })
    const newId = inserted[0]?.id
    if (!newId) throw new Error('导入流水失败')
    recordIdMap.set(record.id, newId)
  }

  const seenRecordRelations = new Set<string>()
  for (const relation of snapshot.recordRelations) {
    const key = `${relation.recordId}:${relation.relatedRecordId}`
    if (seenRecordRelations.has(key)) continue
    seenRecordRelations.add(key)
    const recordId = recordIdMap.get(relation.recordId)
    const relatedRecordId = recordIdMap.get(relation.relatedRecordId)
    if (recordId === undefined) throw new Error(`记录不存在: ${relation.recordId}`)
    if (relatedRecordId === undefined) {
      throw new Error(`记录不存在: ${relation.relatedRecordId}`)
    }
    await tx.insert(recordWithRecord).values({
      recordId,
      relatedRecordId,
      createdTime: relation.createdTime,
      updatedTime: relation.updatedTime,
    })
  }

  const seenTagRelations = new Set<string>()
  for (const relation of snapshot.tagRelations) {
    const key = `${relation.recordId}:${relation.tagId}`
    if (seenTagRelations.has(key)) continue
    seenTagRelations.add(key)
    const recordId = recordIdMap.get(relation.recordId)
    const tagId = tagIdMap.get(relation.tagId)
    if (recordId === undefined) throw new Error(`记录不存在: ${relation.recordId}`)
    if (tagId === undefined) throw new Error(`标签不存在: ${relation.tagId}`)
    await tx.insert(tagWithRecord).values({
      recordId,
      tagId,
      createdTime: relation.createdTime,
      updatedTime: relation.updatedTime,
    })
  }

  const seenImages = new Set<string>()
  for (const image of snapshot.images) {
    const key = `${image.recordId}:${image.imagePath}`
    if (seenImages.has(key)) continue
    seenImages.add(key)
    const recordId = recordIdMap.get(image.recordId)
    if (recordId === undefined) throw new Error(`记录不存在: ${image.recordId}`)
    await tx.insert(imageWithRelated).values({
      recordId,
      imagePath: image.imagePath,
      createdTime: image.createdTime,
      updatedTime: image.updatedTime,
    })
  }

  for (const template of snapshot.quickTemplates) {
    const typeId = typeIdMap.get(template.typeId)
    if (!typeId) throw new Error(`类型不存在: ${template.typeId}`)
    const assetId = template.assetId === 0 ? 0 : assetIdMap.get(template.assetId)
    if (assetId === undefined) throw new Error(`资产不存在: ${template.assetId}`)
    const intoAssetId = template.intoAssetId === 0
      ? 0
      : assetIdMap.get(template.intoAssetId)
    if (intoAssetId === undefined) {
      throw new Error(`资产不存在: ${template.intoAssetId}`)
    }
    const mappedTagIds = Array.from(
      new Set(
        template.tagIds
          .map(tagId => tagIdMap.get(tagId))
          .filter((tagId): tagId is number => tagId !== undefined)
          .filter(tagId => tagId > 0),
      ),
    )
    if (mappedTagIds.length !== new Set(template.tagIds.filter(tagId => tagId !== 0)).size) {
      throw new Error('快捷模板引用了不存在的标签')
    }

    await tx.insert(quickTemplates).values({
      booksId: bookId,
      name: template.name,
      typeCategory: template.typeCategory,
      typeId,
      amount: template.amount,
      charge: template.charge,
      remark: template.remark,
      assetId,
      intoAssetId,
      reimbursable: template.reimbursable ? REIMBURSABLE.reimbursable : REIMBURSABLE.notReimbursable,
      tagIds: JSON.stringify(mappedTagIds),
      icon: template.icon,
      sort: template.sort,
      createdTime: template.createdTime,
      updatedTime: template.updatedTime,
    })
  }

  const threadIdMap = new Map<number, number>()
  for (const thread of snapshot.agentThreads) {
    const inserted = await tx
      .insert(agentThreads)
      .values({
        booksId: bookId,
        title: thread.title,
        providerId: 0,
        modelId: '',
        createdTime: thread.createdTime,
        updatedTime: thread.updatedTime,
      })
      .returning({ id: agentThreads.id })
    const newId = inserted[0]?.id
    if (!newId) throw new Error('导入会话失败')
    threadIdMap.set(thread.id, newId)
  }

  const idMaps = {
    types: typeIdMap,
    assets: assetIdMap,
    tags: tagIdMap,
    records: recordIdMap,
    threads: threadIdMap,
  }
  for (const message of snapshot.agentMessages) {
    const threadId = threadIdMap.get(message.threadId)
    if (threadId === undefined) throw new Error(`会话不存在: ${message.threadId}`)
    const mapped = options.mapAgentMessage
      ? options.mapAgentMessage(message, idMaps)
      : message
    await tx.insert(agentMessages).values({
      threadId,
      role: mapped.role,
      message: mapped.message,
      usage: mapped.usage,
      createdTime: message.createdTime,
      updatedTime: message.updatedTime,
    })
  }

  return {
    bookId,
    name,
    counts: {
      types: snapshot.types.length,
      assets: snapshot.assets.length,
      tags: snapshot.tags.length,
      records: snapshot.records.length,
      recordRelations: snapshot.recordRelations.length,
      tagRelations: snapshot.tagRelations.length,
      images: snapshot.images.length,
      quickTemplates: snapshot.quickTemplates.length,
      agentThreads: snapshot.agentThreads.length,
      agentMessages: snapshot.agentMessages.length,
    },
  }
}

export function applyBookSnapshot(
  db: Database,
  snapshot: BookSnapshot,
  options: ApplySnapshotOptions = {},
): Promise<ApplyBookSnapshotResult> {
  return db.transaction(tx => applyBookSnapshotTx(tx, snapshot, options))
}

export function applyLibrarySnapshot(
  db: Database,
  snapshot: LibrarySnapshot,
  options: ApplySnapshotOptions = {},
): Promise<ApplyLibrarySnapshotResult> {
  return db.transaction(async tx => {
    const results: ApplyBookSnapshotResult[] = []
    for (const book of snapshot.books) {
      results.push(await applyBookSnapshotTx(tx, book, options))
    }
    return { books: results }
  })
}
