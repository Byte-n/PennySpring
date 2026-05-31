import { RECORD_TYPE_CATEGORY } from '../src/constants'
import { createTag, deleteTag, updateTag } from '../src/services/tag-service'
import { createType, deleteType, updateType } from '../src/services/type-service'
import type { Database } from '../src/runtime'
import type { Tx } from '../src/services/types'

function mockDbWithTx(tx: Tx): Database {
  return {
    transaction: jest.fn((callback) => callback(tx)),
  } as unknown as Database
}

describe('tag-service', () => {
  test('creates a tag and returns inserted row', async () => {
    const get = jest.fn().mockResolvedValue({ id: 1, name: '餐饮', icon: 'ForkKnife', invisible: 'visible' })
    const tx = {
      select: jest.fn().mockReturnValue({ from: jest.fn().mockReturnValue({ where: jest.fn().mockReturnValue({ get }) }) }),
      insert: jest.fn().mockReturnValue({ values: jest.fn().mockReturnValue({ returning: jest.fn().mockResolvedValue([{ id: 1 }]) }) }),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as Tx
    const db = mockDbWithTx(tx)

    const row = await createTag(db, { name: '餐饮', icon: 'ForkKnife' })

    expect(row).toEqual({ id: 1, name: '餐饮', icon: 'ForkKnife', invisible: 'visible' })
  })

  test('updates tag fields', async () => {
    const get = jest
      .fn()
      .mockResolvedValueOnce({ id: 2, name: '旧标签', icon: '', invisible: 'visible' })
      .mockResolvedValueOnce({ id: 2, name: '新标签', icon: 'ShoppingCart', invisible: 'hidden' })

    const tx = {
      select: jest.fn().mockReturnValue({ from: jest.fn().mockReturnValue({ where: jest.fn().mockReturnValue({ get }) }) }),
      insert: jest.fn(),
      update: jest.fn().mockReturnValue({ set: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue(undefined) }) }),
      delete: jest.fn(),
    } as unknown as Tx
    const db = mockDbWithTx(tx)

    const row = await updateTag(db, { id: 2, name: '新标签', icon: 'ShoppingCart', invisible: 'hidden' })

    expect(row).toEqual({ id: 2, name: '新标签', icon: 'ShoppingCart', invisible: 'hidden' })
  })

  test('deletes unused tag', async () => {
    const countGet = jest.fn().mockResolvedValue({ count: 0 })
    const tx = {
      select: jest.fn().mockReturnValue({ from: jest.fn().mockReturnValue({ where: jest.fn().mockReturnValue({ get: countGet }) }) }),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue(undefined) }),
    } as unknown as Tx
    const db = mockDbWithTx(tx)

    await expect(deleteTag(db, 3)).resolves.toBeUndefined()
  })

  test('throws when deleting used tag', async () => {
    const countGet = jest.fn().mockResolvedValue({ count: 1 })
    const tx = {
      select: jest.fn().mockReturnValue({ from: jest.fn().mockReturnValue({ where: jest.fn().mockReturnValue({ get: countGet }) }) }),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as Tx
    const db = mockDbWithTx(tx)

    await expect(deleteTag(db, 3)).rejects.toThrow('Tag is in use: 3')
  })
})

describe('type-service', () => {
  test('creates a type with parentId', async () => {
    const get = jest.fn().mockResolvedValue({ id: 1, parentId: 9, name: '早餐', icon: 'Sun' })
    const tx = {
      select: jest.fn().mockReturnValue({ from: jest.fn().mockReturnValue({ where: jest.fn().mockReturnValue({ get }) }) }),
      insert: jest.fn().mockReturnValue({ values: jest.fn().mockReturnValue({ returning: jest.fn().mockResolvedValue([{ id: 1 }]) }) }),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as Tx
    const db = mockDbWithTx(tx)

    const row = await createType(db, {
      parentId: 9,
      name: '早餐',
      icon: 'Sun',
      typeCategory: RECORD_TYPE_CATEGORY.expense,
    })

    expect(row).toEqual({ id: 1, parentId: 9, name: '早餐', icon: 'Sun' })
  })

  test('updates type fields', async () => {
    const get = jest
      .fn()
      .mockResolvedValueOnce({ id: 4, parentId: 0, name: '旧类型', icon: 'ForkKnife', typeCategory: 'expense' })
      .mockResolvedValueOnce({ id: 4, parentId: 0, name: '新类型', icon: 'CookingPot', typeCategory: 'expense' })

    const tx = {
      select: jest.fn().mockReturnValue({ from: jest.fn().mockReturnValue({ where: jest.fn().mockReturnValue({ get }) }) }),
      insert: jest.fn(),
      update: jest.fn().mockReturnValue({ set: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue(undefined) }) }),
      delete: jest.fn(),
    } as unknown as Tx
    const db = mockDbWithTx(tx)

    const row = await updateType(db, {
      id: 4,
      name: '新类型',
      icon: 'CookingPot',
      typeCategory: RECORD_TYPE_CATEGORY.expense,
    })

    expect(row).toEqual({ id: 4, parentId: 0, name: '新类型', icon: 'CookingPot', typeCategory: 'expense' })
  })

  test('deletes unused type', async () => {
    const select = jest
      .fn()
      .mockReturnValueOnce({ from: jest.fn().mockReturnValue({ where: jest.fn().mockReturnValue({ get: jest.fn().mockResolvedValue({ count: 0 }) }) }) })
      .mockReturnValueOnce({ from: jest.fn().mockReturnValue({ where: jest.fn().mockReturnValue({ get: jest.fn().mockResolvedValue({ count: 0 }) }) }) })

    const tx = {
      select,
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue(undefined) }),
    } as unknown as Tx
    const db = mockDbWithTx(tx)

    await expect(deleteType(db, 5)).resolves.toBeUndefined()
  })

  test('throws when deleting type used by record', async () => {
    const select = jest
      .fn()
      .mockReturnValueOnce({ from: jest.fn().mockReturnValue({ where: jest.fn().mockReturnValue({ get: jest.fn().mockResolvedValue({ count: 1 }) }) }) })

    const tx = {
      select,
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as Tx
    const db = mockDbWithTx(tx)

    await expect(deleteType(db, 5)).rejects.toThrow('Type is in use: 5')
  })

  test('throws when deleting type with children', async () => {
    const select = jest
      .fn()
      .mockReturnValueOnce({ from: jest.fn().mockReturnValue({ where: jest.fn().mockReturnValue({ get: jest.fn().mockResolvedValue({ count: 0 }) }) }) })
      .mockReturnValueOnce({ from: jest.fn().mockReturnValue({ where: jest.fn().mockReturnValue({ get: jest.fn().mockResolvedValue({ count: 2 }) }) }) })

    const tx = {
      select,
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as Tx
    const db = mockDbWithTx(tx)

    await expect(deleteType(db, 5)).rejects.toThrow('Type has children: 5')
  })
})
