import { and, asc, count, eq, inArray, gte, lt } from 'drizzle-orm'

import type { RecordTypeCategoryValue } from '../constants'
import { RECORD_TYPE_SPECIAL_BEHAVIOR, SYSTEM_STATUS } from '../constants'
import type { Database } from '../types'
import { records, types } from '../schema'
import type { CreateTypeInput, RecordTimeRange, Tx, TypeRow, UpdateTypeInput } from './types'

export interface CategoryItem {
  id: number
  name: string
  icon: string
  children?: CategoryItem[]
}

export async function getTypesByCategory(db: Database, typeCategory: RecordTypeCategoryValue, booksId: number): Promise<TypeRow[]> {
  return db.select().from(types).where(and(eq(types.typeCategory, typeCategory), eq(types.booksId, booksId))).orderBy(asc(types.sort)).all()
}

export function buildCategoryTree(rows: TypeRow[]): CategoryItem[] {
  const parents = rows.filter(r => r.parentId === 0)
  return parents.map(p => ({
    id: p.id,
    name: p.name,
    icon: p.icon,
    children: rows
      .filter(r => r.parentId === p.id)
      .map(c => ({ id: c.id, name: c.name, icon: c.icon })),
  }))
}

export async function getAllTypes(
  db: Database,
  booksId: number,
  range?: RecordTimeRange,
): Promise<TypeRow[]> {
  if (!range) {
    return db.select().from(types).where(eq(types.booksId, booksId)).orderBy(asc(types.sort)).all()
  }

  const usedTypes = await db
    .select({ typeId: records.typeId })
    .from(records)
    .where(and(
      eq(records.booksId, booksId),
      gte(records.recordTime, range.startTime),
      lt(records.recordTime, range.endTime),
    ))
    .all()
  const typeIds = [...new Set(usedTypes.map(row => row.typeId))]
  if (typeIds.length === 0) return []

  const usedTypeRows = await db
    .select({ id: types.id, parentId: types.parentId })
    .from(types)
    .where(and(eq(types.booksId, booksId), inArray(types.id, typeIds)))
    .all()
  const parentIds = usedTypeRows
    .map(type => type.parentId)
    .filter(parentId => parentId !== 0)
  const requestedIds = [...new Set([...typeIds, ...parentIds])]

  return db
    .select()
    .from(types)
    .where(and(eq(types.booksId, booksId), inArray(types.id, requestedIds)))
    .orderBy(asc(types.sort))
    .all()
}

function validateTypeInput(input: CreateTypeInput | UpdateTypeInput): void {
  if (!input.name.trim()) {
    throw new Error('name is required')
  }
}

async function getTypeRow(tx: Tx, id: number, booksId: number): Promise<TypeRow> {
  const row = await tx.select().from(types).where(eq(types.id, id)).get()
  if (!row) {
    throw new Error(`Type not found: ${id}`)
  }
  if (row.booksId !== booksId) {
    throw new Error(`Type ${id} does not belong to book ${booksId}`)
  }
  return row
}

export function createType(db: Database, input: CreateTypeInput): Promise<TypeRow> {
  validateTypeInput(input)

  return db.transaction(async (tx) => {
    const inserted = await tx.insert(types)
      .values({
        booksId: input.booksId,
        parentId: input.parentId ?? 0,
        name: input.name,
        icon: input.icon,
        typeCategory: input.typeCategory,
        isSystem: input.isSystem ?? SYSTEM_STATUS.custom,
        specialBehavior: input.specialBehavior ?? RECORD_TYPE_SPECIAL_BEHAVIOR.none,
        sort: input.sort ?? 1,
      })
      .returning({ id: types.id })

    const id = inserted[0]?.id
    if (!id) {
      throw new Error('Failed to create type')
    }

    return getTypeRow(tx, id, input.booksId)
  })
}

export function updateType(db: Database, input: UpdateTypeInput): Promise<TypeRow> {
  validateTypeInput(input)

  return db.transaction(async (tx) => {
    await getTypeRow(tx, input.id, input.booksId)

    await tx.update(types)
      .set({
        parentId: input.parentId ?? 0,
        name: input.name,
        icon: input.icon,
        typeCategory: input.typeCategory,
        isSystem: input.isSystem ?? SYSTEM_STATUS.custom,
        specialBehavior: input.specialBehavior ?? RECORD_TYPE_SPECIAL_BEHAVIOR.none,
        sort: input.sort ?? 1,
      })
      .where(eq(types.id, input.id))

    return getTypeRow(tx, input.id, input.booksId)
  })
}

export function deleteType(db: Database, id: number, booksId: number): Promise<void> {
  return db.transaction(async (tx) => {
    await getTypeRow(tx, id, booksId)

    const referencedCountRow = await tx.select({ count: count() })
      .from(records)
      .where(eq(records.typeId, id))
      .get()

    if ((referencedCountRow?.count ?? 0) > 0) {
      throw new Error(`Type is in use: ${id}`)
    }

    const childrenCountRow = await tx.select({ count: count() })
      .from(types)
      .where(eq(types.parentId, id))
      .get()

    if ((childrenCountRow?.count ?? 0) > 0) {
      throw new Error(`Type has children: ${id}`)
    }

    await tx.delete(types).where(eq(types.id, id))
  })
}
