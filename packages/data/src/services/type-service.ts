import { count, eq } from 'drizzle-orm'

import { RECORD_TYPE_SPECIAL_BEHAVIOR, SYSTEM_STATUS } from '../constants'
import type { Database } from '../runtime'
import { records, types } from '../schema'
import type { CreateTypeInput, Tx, TypeRow, UpdateTypeInput } from './types'

function validateTypeInput(input: CreateTypeInput | UpdateTypeInput): void {
  if (!input.name.trim()) {
    throw new Error('name is required')
  }
}

async function getTypeRow(tx: Tx, id: number): Promise<TypeRow> {
  const row = await tx.select().from(types).where(eq(types.id, id)).get()
  if (!row) {
    throw new Error(`Type not found: ${id}`)
  }
  return row
}

export function createType(db: Database, input: CreateTypeInput): Promise<TypeRow> {
  validateTypeInput(input)

  return db.transaction(async (tx) => {
    const inserted = await tx.insert(types)
      .values({
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

    return getTypeRow(tx, id)
  })
}

export function updateType(db: Database, input: UpdateTypeInput): Promise<TypeRow> {
  validateTypeInput(input)

  return db.transaction(async (tx) => {
    await getTypeRow(tx, input.id)

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

    return getTypeRow(tx, input.id)
  })
}

export function deleteType(db: Database, id: number): Promise<void> {
  return db.transaction(async (tx) => {
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
