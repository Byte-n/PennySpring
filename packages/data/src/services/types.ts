import type { InferSelectModel } from 'drizzle-orm'

import type { ReimbursableValue } from '../constants'
import type { assets, records, types } from '../schema'
import type { Database } from '../runtime'

export type Tx = Parameters<Parameters<Database['transaction']>[0]>[0]

export type RecordRow = InferSelectModel<typeof records>
export type AssetRow = InferSelectModel<typeof assets>
export type TypeRow = InferSelectModel<typeof types>

interface CreateRecordInputBase {
  typeId: number
  booksId: number
  amount: number
  charge?: number
  remark?: string
  recordTime: number
  tagIds?: number[]
  imagePaths?: string[]
  relatedRecordIds?: number[]
}

interface UpdateRecordInputBase extends CreateRecordInputBase {
  id: number
}

export interface CreateCashflowRecordInput extends CreateRecordInputBase {
  assetId?: number
  intoAssetId?: number
  reimbursable: ReimbursableValue
}

export interface UpdateCashflowRecordInput extends UpdateRecordInputBase {
  assetId?: number
  intoAssetId?: number
  reimbursable: ReimbursableValue
}

export interface CreateTransferRecordInput extends CreateRecordInputBase {
  assetId: number
  intoAssetId: number
  reimbursable?: ReimbursableValue
}

export interface UpdateTransferRecordInput extends UpdateRecordInputBase {
  assetId: number
  intoAssetId: number
  reimbursable?: ReimbursableValue
}

export type CreateRecordInput = CreateCashflowRecordInput | CreateTransferRecordInput
export type UpdateRecordInput = UpdateCashflowRecordInput | UpdateTransferRecordInput
