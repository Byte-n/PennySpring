import type { InferSelectModel } from 'drizzle-orm'

import type { ReimbursableValue } from '../constants'
import type { assets, records, types } from '../schema'
import type { Database } from '../runtime'

export type Tx = Parameters<Parameters<Database['transaction']>[0]>[0]

export type RecordRow = InferSelectModel<typeof records>
export type AssetRow = InferSelectModel<typeof assets>
export type TypeRow = InferSelectModel<typeof types>

export interface CreateRecordInput {
  typeId: number
  assetId: number
  intoAssetId?: number
  booksId: number
  amount: number
  charge?: number
  remark?: string
  reimbursable?: ReimbursableValue
  recordTime: number
  tagIds?: number[]
  imagePaths?: string[]
  relatedRecordIds?: number[]
}

export interface UpdateRecordInput {
  id: number
  typeId: number
  assetId: number
  intoAssetId?: number
  booksId: number
  amount: number
  charge?: number
  remark?: string
  reimbursable?: ReimbursableValue
  recordTime: number
  tagIds?: number[]
  imagePaths?: string[]
  relatedRecordIds?: number[]
}
