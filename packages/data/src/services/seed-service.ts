import {
  RECORD_TYPE_SPECIAL_BEHAVIOR,
  SYSTEM_STATUS,
} from '../constants'
import { books } from '../schema'
import { SYSTEM_TYPE_SEEDS } from '../seeds/system-types'
import { types } from '../schema'
import type { Database } from '../types'
import { createBook } from './book-service'
import type { Tx } from './types'

/**
 * 为指定账本写入系统默认类型数据。
 *
 * 在同一事务内完成：先插一级类型拿到自增 id，再用映射后的 parentId 插二级类型。
 * 可在 {@link createBook} 事务内直接调用，也可独立使用。
 */
export async function seedSystemTypesForBook(
  tx: Tx,
  booksId: number,
): Promise<void> {
  for (const seed of SYSTEM_TYPE_SEEDS) {
    const inserted = await tx
      .insert(types)
      .values({
        booksId,
        parentId: 0,
        name: seed.name,
        icon: seed.icon,
        typeCategory: seed.typeCategory,
        isSystem: SYSTEM_STATUS.system,
        specialBehavior: seed.specialBehavior ?? RECORD_TYPE_SPECIAL_BEHAVIOR.none,
        sort: seed.sort,
      })
      .returning({ id: types.id })

    const parentId = inserted[0]?.id
    if (!parentId) {
      throw new Error(`Failed to seed parent type: ${seed.name}`)
    }

    if (!seed.children?.length) continue

    for (const child of seed.children) {
      await tx.insert(types).values({
        booksId,
        parentId,
        name: child.name,
        icon: child.icon,
        typeCategory: seed.typeCategory,
        isSystem: SYSTEM_STATUS.system,
        specialBehavior:
          child.specialBehavior ?? RECORD_TYPE_SPECIAL_BEHAVIOR.none,
        sort: child.sort,
      })
    }
  }
}

/**
 * 确保至少存在一个可用账本。
 *
 * 若数据库中无任何账本，则创建「默认账本」——createBook 内部会自动调用
 * {@link seedSystemTypesForBook} 写入系统默认类型数据。
 *
 * 在数据库迁移完成后调用；迁移脚本只需建表，账本与类型数据的
 * 唯一事实来源保留在 {@link SYSTEM_TYPE_SEEDS} 与 {@link createBook}。
 */
export async function ensureDefaultBook(db: Database): Promise<void> {
  const book = await db.select().from(books).limit(1).get()
  if (book) return

  await createBook(db, { name: '默认账本' })
}
