import type {
  Api,
  CreateAssetInput,
  CreateBookInput,
  CreateRecordInput,
  CreateTagInput,
  CreateTypeInput,
  RecordTypeCategoryValue,
  UpdateAssetInput,
  UpdateBookInput,
  UpdateRecordInput,
  UpdateTagInput,
  UpdateTypeInput,
} from '@pennyspring/data'

import { buildPath } from './contract'

const SERVER_URL = process.env.SERVER_URL
if (!SERVER_URL) {
  throw new Error('SERVER_URL 未设置（remote 模式需构建期注入）')
}

/**
 * 通用 POST：请求体=参数数组（按位置），响应={result}|{error}。
 * 与 data-server-wrapper 约定一致；T 由调用点的 Api 形状从返回类型推断。
 */
async function call<T>(group: string, method: string, args: unknown[]): Promise<T> {
  const res = await fetch(`${SERVER_URL}${buildPath(group, method)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(args),
  })
  const data = (await res.json()) as { result?: unknown; error?: string }
  if (!res.ok) {
    throw new Error(data.error ?? `HTTP ${res.status}`)
  }
  if (data.error) {
    throw new Error(data.error)
  }
  return data.result as T
}

export const api: Api = {
  get: () => Promise.reject(new Error('remote 模式不支持 api.get')),
  record: {
    create: (input: CreateRecordInput) => call('record', 'create', [input]),
    update: (input: UpdateRecordInput) => call('record', 'update', [input]),
    delete: (recordId: number) => call('record', 'delete', [recordId]),
    getByBook: (booksId: number) => call('record', 'getByBook', [booksId]),
    getDetailById: (recordId: number) => call('record', 'getDetailById', [recordId]),
  },
  tag: {
    getAll: () => call('tag', 'getAll', []),
    create: (input: CreateTagInput) => call('tag', 'create', [input]),
    update: (input: UpdateTagInput) => call('tag', 'update', [input]),
    delete: (tagId: number) => call('tag', 'delete', [tagId]),
  },
  type: {
    getAll: () => call('type', 'getAll', []),
    create: (input: CreateTypeInput) => call('type', 'create', [input]),
    update: (input: UpdateTypeInput) => call('type', 'update', [input]),
    delete: (typeId: number) => call('type', 'delete', [typeId]),
    getByCategory: (typeCategory: RecordTypeCategoryValue) =>
      call('type', 'getByCategory', [typeCategory]),
  },
  book: {
    getAll: () => call('book', 'getAll', []),
    getDefault: () => call('book', 'getDefault', []),
    getById: (bookId: number) => call('book', 'getById', [bookId]),
    create: (input: CreateBookInput) => call('book', 'create', [input]),
    update: (input: UpdateBookInput) => call('book', 'update', [input]),
    delete: (bookId: number) => call('book', 'delete', [bookId]),
  },
  asset: {
    getAll: () => call('asset', 'getAll', []),
    getByBook: (booksId: number) => call('asset', 'getByBook', [booksId]),
    create: (input: CreateAssetInput) => call('asset', 'create', [input]),
    update: (input: UpdateAssetInput) => call('asset', 'update', [input]),
    delete: (assetId: number) => call('asset', 'delete', [assetId]),
  },
}
