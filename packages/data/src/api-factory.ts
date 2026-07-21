import type { RecordTypeCategoryValue } from './constants'
import * as services from './services'
import type {
  CreateAssetInput,
  CreateBookInput,
  CreateRecordInput,
  CreateTagInput,
  CreateTypeInput,
  UpdateAssetInput,
  UpdateBookInput,
  UpdateRecordInput,
  UpdateTagInput,
  UpdateTypeInput,
} from './services'
import type { Database } from './types'

/**
 * createApi：把 services 按 api 形状组装成调度器（1 方法 → 1 service 函数）。
 * 驱动无关：getDatabase 由各适配层（data-rn / data-server）注入，事务边界保留在 services。
 */
export function createApi(getDatabase: () => Promise<Database>) {
  return {
    get: getDatabase,
    record: {
      create: async (input: CreateRecordInput) => services.createRecord(await getDatabase(), input),
      update: async (input: UpdateRecordInput) => services.updateRecord(await getDatabase(), input),
      delete: async (recordId: number, booksId: number) => services.deleteRecord(await getDatabase(), recordId, booksId),
      getByBook: async (booksId: number) => services.getRecordsByBook(await getDatabase(), booksId),
      getDetailById: async (recordId: number, booksId: number) => services.getRecordDetailById(await getDatabase(), recordId, booksId),
    },
    tag: {
      getAll: async (booksId: number) => services.getAllTags(await getDatabase(), booksId),
      create: async (input: CreateTagInput) => services.createTag(await getDatabase(), input),
      update: async (input: UpdateTagInput) => services.updateTag(await getDatabase(), input),
      delete: async (tagId: number, booksId: number) => services.deleteTag(await getDatabase(), tagId, booksId),
    },
    type: {
      getAll: async (booksId: number) => services.getAllTypes(await getDatabase(), booksId),
      create: async (input: CreateTypeInput) => services.createType(await getDatabase(), input),
      update: async (input: UpdateTypeInput) => services.updateType(await getDatabase(), input),
      delete: async (typeId: number, booksId: number) => services.deleteType(await getDatabase(), typeId, booksId),
      getByCategory: async (typeCategory: RecordTypeCategoryValue, booksId: number) =>
        services.getTypesByCategory(await getDatabase(), typeCategory, booksId),
    },
    book: {
      getAll: async () => services.getAllBooks(await getDatabase()),
      getDefault: async () => services.getDefaultBook(await getDatabase()),
      getById: async (bookId: number) => services.getBookById(await getDatabase(), bookId),
      create: async (input: CreateBookInput) => services.createBook(await getDatabase(), input),
      update: async (input: UpdateBookInput) => services.updateBook(await getDatabase(), input),
      delete: async (bookId: number) => services.deleteBook(await getDatabase(), bookId),
    },
    asset: {
      getAll: async (booksId: number) => services.getAllAssets(await getDatabase(), booksId),
      getByBook: async (booksId: number) => services.getAssetsByBook(await getDatabase(), booksId),
      create: async (input: CreateAssetInput) => services.createAsset(await getDatabase(), input),
      update: async (input: UpdateAssetInput) => services.updateAsset(await getDatabase(), input),
      delete: async (assetId: number, booksId: number) => services.deleteAsset(await getDatabase(), assetId, booksId),
    },
  }
}

export type Api = ReturnType<typeof createApi>
