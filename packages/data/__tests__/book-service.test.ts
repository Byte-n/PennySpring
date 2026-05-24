import { createBook, getBookById, getDefaultBook, updateBook } from '../src/services/book-service'
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

  test('createBook saves background image URI', async () => {
    const values = jest.fn().mockReturnValue({
      returning: jest.fn().mockResolvedValue([{ id: 3 }]),
    })
    const get = jest.fn().mockResolvedValue({
      id: 3,
      name: '家庭账本',
      description: '',
      background: 'file:///family.jpg',
      createdTime: 1234567890000,
      updatedTime: 1234567890000,
    })
    const tx = {
      insert: jest.fn().mockReturnValue({ values }),
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({ get }),
        }),
      }),
    }
    const db = {
      transaction: jest.fn(async (callback) => callback(tx)),
    } as unknown as Database

    const book = await createBook(db, {
      name: '家庭账本',
      background: 'file:///family.jpg',
    })

    expect(values).toHaveBeenCalledWith({
      name: '家庭账本',
      description: '',
      background: 'file:///family.jpg',
    })
    expect(book.background).toBe('file:///family.jpg')
  })

  test('updateBook saves background image URI', async () => {
    const set = jest.fn().mockReturnValue({
      where: jest.fn().mockResolvedValue(undefined),
    })
    const get = jest
      .fn()
      .mockResolvedValueOnce({
        id: 4,
        name: '旧账本',
        description: '',
        background: '',
        createdTime: 1234567890000,
        updatedTime: 1234567890000,
      })
      .mockResolvedValueOnce({
        id: 4,
        name: '旅行账本',
        description: '旅行专用',
        background: 'file:///travel.jpg',
        createdTime: 1234567890000,
        updatedTime: 1234567890000,
      })
    const tx = {
      update: jest.fn().mockReturnValue({ set }),
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({ get }),
        }),
      }),
    }
    const db = {
      transaction: jest.fn(async (callback) => callback(tx)),
    } as unknown as Database

    const book = await updateBook(db, {
      id: 4,
      name: '旅行账本',
      description: '旅行专用',
      background: 'file:///travel.jpg',
    })

    expect(set).toHaveBeenCalledWith({
      name: '旅行账本',
      description: '旅行专用',
      background: 'file:///travel.jpg',
    })
    expect(book.background).toBe('file:///travel.jpg')
  })
})
