import type { InferSelectModel } from 'drizzle-orm'
import { asc, eq, inArray, max } from 'drizzle-orm'

import type { RecordTypeCategoryValue } from '../constants'
import { REIMBURSABLE } from '../constants'
import { quickTemplates, tags, types } from '../schema'
import type { Database } from '../types'
import { getOptionalAssetForBooks, validateBookExists } from './helpers'
import type {
  CreateQuickTemplateInput,
  QuickTemplateRow,
  Tx,
  UpdateQuickTemplateInput,
} from './types'

type QuickTemplateDbRow = InferSelectModel<typeof quickTemplates>

function parseTagIds(raw: string): number[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }
  if (!Array.isArray(parsed)) {
    return []
  }
  return Array.from(
    new Set(
      parsed.filter(
        (value): value is number =>
          typeof value === 'number' && Number.isInteger(value) && value > 0,
      ),
    ),
  )
}

function toQuickTemplateRow(row: QuickTemplateDbRow): QuickTemplateRow {
  return {
    id: row.id,
    booksId: row.booksId,
    name: row.name,
    typeCategory: row.typeCategory,
    typeId: row.typeId,
    amount: row.amount,
    charge: row.charge,
    remark: row.remark,
    assetId: row.assetId,
    intoAssetId: row.intoAssetId,
    reimbursable: row.reimbursable === REIMBURSABLE.reimbursable,
    tagIds: parseTagIds(row.tagIds),
    icon: row.icon,
    sort: row.sort,
    createdTime: row.createdTime,
    updatedTime: row.updatedTime,
  }
}

function normalizeTemplateInput(input: CreateQuickTemplateInput | UpdateQuickTemplateInput) {
  const name = input.name.trim()
  if (!name) {
    throw new Error('模板名称不能为空')
  }
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error('金额必须大于 0')
  }
  const charge = input.charge ?? 0
  if (!Number.isFinite(charge) || charge < 0) {
    throw new Error('手续费不能小于 0')
  }
  const typeId = Math.trunc(input.typeId)
  if (!Number.isInteger(typeId) || typeId <= 0) {
    throw new Error('请选择分类')
  }
  const assetId = Math.trunc(input.assetId ?? 0)
  const intoAssetId = Math.trunc(input.intoAssetId ?? 0)
  const sort = input.sort === undefined ? undefined : Math.trunc(input.sort)

  return {
    booksId: input.booksId,
    name,
    typeCategory: input.typeCategory,
    typeId,
    amount: Math.trunc(input.amount),
    charge: Math.trunc(charge),
    remark: input.remark?.trim() ?? '',
    assetId: assetId > 0 ? assetId : 0,
    intoAssetId: intoAssetId > 0 ? intoAssetId : 0,
    reimbursable: input.reimbursable === true,
    tagIds: Array.isArray(input.tagIds) ? input.tagIds : [],
    icon: input.icon?.trim() ?? '',
    sort,
  }
}

async function getTemplateDbRow(
  tx: Tx,
  templateId: number,
  booksId: number,
): Promise<QuickTemplateDbRow> {
  const row = await tx
    .select()
    .from(quickTemplates)
    .where(eq(quickTemplates.id, templateId))
    .get()
  if (!row) {
    throw new Error(`快捷模板不存在: ${templateId}`)
  }
  if (row.booksId !== booksId) {
    throw new Error(`快捷模板 ${templateId} 不属于账本 ${booksId}`)
  }
  return row
}

async function validateTypeForBook(
  tx: Tx,
  typeId: number,
  booksId: number,
  typeCategory: RecordTypeCategoryValue,
): Promise<void> {
  const row = await tx
    .select({ booksId: types.booksId, typeCategory: types.typeCategory })
    .from(types)
    .where(eq(types.id, typeId))
    .get()
  if (!row) {
    throw new Error(`类型不存在: ${typeId}`)
  }
  if (row.booksId !== booksId) {
    throw new Error(`类型 ${typeId} 不属于账本 ${booksId}`)
  }
  if (row.typeCategory !== typeCategory) {
    throw new Error('分类与记录类型不匹配')
  }
}

async function normalizeTagIds(tx: Tx, tagIds: number[] | undefined, booksId: number): Promise<number[]> {
  const uniqueIds = Array.from(
    new Set((tagIds ?? []).filter(id => Number.isInteger(id) && id > 0)),
  )
  if (uniqueIds.length === 0) {
    return []
  }

  const rows = await tx
    .select({ id: tags.id, booksId: tags.booksId })
    .from(tags)
    .where(inArray(tags.id, uniqueIds))
  const booksIdByTagId = new Map(rows.map(row => [row.id, row.booksId]))

  for (const tagId of uniqueIds) {
    const tagBooksId = booksIdByTagId.get(tagId)
    if (tagBooksId === undefined) {
      throw new Error(`标签不存在: ${tagId}`)
    }
    if (tagBooksId !== booksId) {
      throw new Error(`标签 ${tagId} 不属于账本 ${booksId}`)
    }
  }

  return uniqueIds
}

async function validateTemplateReferences(
  tx: Tx,
  input: ReturnType<typeof normalizeTemplateInput>,
): Promise<number[]> {
  await validateBookExists(tx, input, 'booksId')
  await validateTypeForBook(tx, input.typeId, input.booksId, input.typeCategory)
  await getOptionalAssetForBooks(tx, input, 'assetId', 'booksId')
  await getOptionalAssetForBooks(tx, input, 'intoAssetId', 'booksId')
  return normalizeTagIds(tx, input.tagIds, input.booksId)
}

export async function listQuickTemplates(
  db: Database,
  booksId: number,
): Promise<QuickTemplateRow[]> {
  const rows = await db
    .select()
    .from(quickTemplates)
    .where(eq(quickTemplates.booksId, booksId))
    .orderBy(asc(quickTemplates.sort), asc(quickTemplates.id))
    .all()
  return rows.map(toQuickTemplateRow)
}

export function createQuickTemplate(
  db: Database,
  input: CreateQuickTemplateInput,
): Promise<QuickTemplateRow> {
  const normalized = normalizeTemplateInput(input)

  return db.transaction(async tx => {
    const tagIds = await validateTemplateReferences(tx, normalized)

    const maxSortRow = await tx
      .select({ value: max(quickTemplates.sort) })
      .from(quickTemplates)
      .where(eq(quickTemplates.booksId, normalized.booksId))
      .get()
    const sort = normalized.sort ?? (maxSortRow?.value ?? 0) + 1

    const inserted = await tx
      .insert(quickTemplates)
      .values({
        booksId: normalized.booksId,
        name: normalized.name,
        typeCategory: normalized.typeCategory,
        typeId: normalized.typeId,
        amount: normalized.amount,
        charge: normalized.charge,
        remark: normalized.remark,
        assetId: normalized.assetId,
        intoAssetId: normalized.intoAssetId,
        reimbursable: normalized.reimbursable
          ? REIMBURSABLE.reimbursable
          : REIMBURSABLE.notReimbursable,
        tagIds: JSON.stringify(tagIds),
        icon: normalized.icon,
        sort,
      })
      .returning({ id: quickTemplates.id })

    const templateId = inserted[0]?.id
    if (templateId === undefined) {
      throw new Error('创建快捷模板失败')
    }
    return toQuickTemplateRow(await getTemplateDbRow(tx, templateId, normalized.booksId))
  })
}

export function updateQuickTemplate(
  db: Database,
  input: UpdateQuickTemplateInput,
): Promise<QuickTemplateRow> {
  const normalized = normalizeTemplateInput(input)

  return db.transaction(async tx => {
    const existing = await getTemplateDbRow(tx, input.id, normalized.booksId)
    const tagIds = await validateTemplateReferences(tx, normalized)
    const sort = normalized.sort ?? existing.sort

    await tx
      .update(quickTemplates)
      .set({
        name: normalized.name,
        typeCategory: normalized.typeCategory,
        typeId: normalized.typeId,
        amount: normalized.amount,
        charge: normalized.charge,
        remark: normalized.remark,
        assetId: normalized.assetId,
        intoAssetId: normalized.intoAssetId,
        reimbursable: normalized.reimbursable
          ? REIMBURSABLE.reimbursable
          : REIMBURSABLE.notReimbursable,
        tagIds: JSON.stringify(tagIds),
        icon: normalized.icon,
        sort,
      })
      .where(eq(quickTemplates.id, input.id))

    return toQuickTemplateRow(await getTemplateDbRow(tx, input.id, normalized.booksId))
  })
}

export function deleteQuickTemplate(
  db: Database,
  templateId: number,
  booksId: number,
): Promise<void> {
  return db.transaction(async tx => {
    await getTemplateDbRow(tx, templateId, booksId)
    await tx.delete(quickTemplates).where(eq(quickTemplates.id, templateId))
  })
}

export function reorderQuickTemplates(
  db: Database,
  booksId: number,
  templateIds: number[],
): Promise<void> {
  return db.transaction(async tx => {
    const rows = await tx
      .select({ id: quickTemplates.id })
      .from(quickTemplates)
      .where(eq(quickTemplates.booksId, booksId))
      .all()
    const existingIds = new Set(rows.map(row => row.id))
    const requestedIds = new Set(templateIds)

    if (
      templateIds.length !== existingIds.size ||
      requestedIds.size !== templateIds.length ||
      templateIds.some(id => !existingIds.has(id))
    ) {
      throw new Error('模板排序数据不完整')
    }

    for (const [index, templateId] of templateIds.entries()) {
      await tx
        .update(quickTemplates)
        .set({ sort: index + 1 })
        .where(eq(quickTemplates.id, templateId))
    }
  })
}
