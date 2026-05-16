import { getBookById, getDefaultBook } from '../src/services/book-service'
import type { Database } from '../src/runtime'

describe('book-service', () => {
  test('getDefaultBook returns first book', async () => {
    const get = jest.fn().mockResolvedValue({
      id: 1,
      name: '默认账本',
      description: '',
      background: '',
      createdTime: 1234567890000,
      updatedTime: 1234567890000,
    })
    const db = {
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({ get }),
        }),
      }),
    } as unknown as Database

    const book = await getDefaultBook(db)

    expect(book).toEqual({
      id: 1,
      name: '默认账本',
      description: '',
      background: '',
      createdTime: 1234567890000,
      updatedTime: 1234567890000,
    })
  })

  test('getDefaultBook throws when no books exist', async () => {
    const get = jest.fn().mockResolvedValue(undefined)

    const db = {
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({ get }),
        }),
      }),
    } as unknown as Database

    await expect(getDefaultBook(db)).rejects.toThrow('未找到默认账本')
  })

  test('getBookById returns specific book', async () => {
    const get = jest.fn().mockResolvedValue({
      id: 2,
      name: '旅行账本',
      description: '旅行专用',
      background: 'travel.jpg',
      createdTime: 1234567890000,
      updatedTime: 1234567890000,
    })
    const db = {
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({ get }),
        }),
      }),
    } as unknown as Database

    const book = await getBookById(db, 2)

    expect(book.id).toBe(2)
    expect(book.name).toBe('旅行账本')
  })

  test('getBookById throws when book not found', async () => {
    const get = jest.fn().mockResolvedValue(undefined)
    const db = {
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({ get }),
        }),
      }),
    } as unknown as Database

    await expect(getBookById(db, 999)).rejects.toThrow('账本不存在: 999')
  })
})
