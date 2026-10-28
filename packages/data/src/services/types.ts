import type { InferSelectModel } from 'drizzle-orm'

import type {
  AgentMessageRoleValue,
  AssetClassificationValue,
  AssetTypeValue,
  RecordTypeCategoryValue,
  RecordTypeSpecialBehaviorValue,
  ReimbursableValue,
  SystemStatusValue,
  VisibilityValue,
} from '../constants'
import type { agentMessages, agentThreads, assets, books, records, recordWithRecord, tags, types } from '../schema'

export type { Tx } from '../types'

export type RecordRow = InferSelectModel<typeof records>
export type RecordRelationRow = InferSelectModel<typeof recordWithRecord>
export type AssetRow = InferSelectModel<typeof assets>
export type TagRow = InferSelectModel<typeof tags>
export type TypeRow = InferSelectModel<typeof types>
export type BookRow = InferSelectModel<typeof books>
export type AgentThreadRow = InferSelectModel<typeof agentThreads>
export type AgentMessageRow = InferSelectModel<typeof agentMessages>

export interface RecordDetail {
  record: RecordRow
  tagIds: number[]
  imagePaths: string[]
  relatedRecordIds: number[]
}

export interface CreateTagInput {
  booksId: number
  name: string
  icon?: string
  invisible?: VisibilityValue
}

export interface UpdateTagInput extends CreateTagInput {
  id: number
}

export interface CreateTypeInput {
  booksId: number
  parentId?: number
  name: string
  icon: string
  typeCategory: RecordTypeCategoryValue
  isSystem?: SystemStatusValue
  specialBehavior?: RecordTypeSpecialBehaviorValue
  sort?: number
}

export interface UpdateTypeInput extends CreateTypeInput {
  id: number
}

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

export interface CreateBookInput {
  name: string
  description?: string
  background?: string
}

export interface UpdateBookInput extends CreateBookInput {
  id: number
}

export interface CreateAssetInput {
  booksId: number
  name: string
  balance?: number
  totalAmount?: number
  billingDate?: number
  repaymentDate?: number
  type: AssetTypeValue
  classification: AssetClassificationValue
  invisible?: VisibilityValue
  openBank?: string
  cardNo?: string
  remark?: string
}

export interface UpdateAssetInput extends CreateAssetInput {
  id: number
}

export interface CreateAgentMessageInput {
  role: AgentMessageRoleValue
  message: string
  usage?: string
}

export interface AgentThreadDetail {
  thread: AgentThreadRow
  messages: AgentMessageRow[]
}
