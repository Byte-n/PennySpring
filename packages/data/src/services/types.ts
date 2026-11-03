import type { InferSelectModel } from 'drizzle-orm';

import type {
  AgentMessageRoleValue,
  AgentReasoningEffort,
  AgentSelectionScope,
  AssetClassificationValue,
  AssetTypeValue,
  RecordTypeCategoryValue,
  RecordTypeSpecialBehaviorValue,
  ReimbursableValue,
  SystemStatusValue,
  VisibilityValue,
} from '../constants';
import type {
  agentMessages,
  agentThreads,
  assets,
  books,
  imageWithRelated,
  records,
  recordWithRecord,
  tagWithRecord,
  tags,
  types,
} from '../schema';

export type { Tx } from '../types';

export type RecordRow = InferSelectModel<typeof records>;
export type RecordRelationRow = InferSelectModel<typeof recordWithRecord>;
export type TagRelationRow = InferSelectModel<typeof tagWithRecord>;
export type ImageRow = InferSelectModel<typeof imageWithRelated>;
export type AssetRow = InferSelectModel<typeof assets>;
export type TagRow = InferSelectModel<typeof tags>;
export type TypeRow = InferSelectModel<typeof types>;
export type BookRow = InferSelectModel<typeof books>;
export type AgentThreadRow = InferSelectModel<typeof agentThreads>;
export type AgentMessageRow = InferSelectModel<typeof agentMessages>;

export interface RecordTimeRange {
  startTime: number;
  endTime: number;
}

export interface RecordListRow {
  record: Pick<RecordRow, 'id'>;
  recordTime: number;
  finalAmount: number;
  category: RecordTypeCategoryValue;
  typeName: string;
  iconValue: TypeRow['icon'] | null;
  assetName: string;
  intoAssetName: string;
  tags: Array<{ id: number; name: string }>;
}

export interface RecordDetail {
  record: RecordRow;
  tagIds: number[];
  imagePaths: string[];
  relatedRecordIds: number[];
}

export interface CreateTagInput {
  booksId: number;
  name: string;
  icon?: string;
  invisible?: VisibilityValue;
}

export interface UpdateTagInput extends CreateTagInput {
  id: number;
}

export interface CreateTypeInput {
  booksId: number;
  parentId?: number;
  name: string;
  icon: string;
  typeCategory: RecordTypeCategoryValue;
  isSystem?: SystemStatusValue;
  specialBehavior?: RecordTypeSpecialBehaviorValue;
  sort?: number;
}

export interface UpdateTypeInput extends CreateTypeInput {
  id: number;
}

interface CreateRecordInputBase {
  typeId: number;
  booksId: number;
  amount: number;
  charge?: number;
  remark?: string;
  recordTime: number;
  tagIds?: number[];
  imagePaths?: string[];
  relatedRecordIds?: number[];
}

interface UpdateRecordInputBase extends CreateRecordInputBase {
  id: number;
}

export interface CreateCashflowRecordInput extends CreateRecordInputBase {
  assetId?: number;
  intoAssetId?: number;
  reimbursable: ReimbursableValue;
}

export interface UpdateCashflowRecordInput extends UpdateRecordInputBase {
  assetId?: number;
  intoAssetId?: number;
  reimbursable: ReimbursableValue;
}

export interface CreateTransferRecordInput extends CreateRecordInputBase {
  assetId: number;
  intoAssetId: number;
  reimbursable?: ReimbursableValue;
}

export interface UpdateTransferRecordInput extends UpdateRecordInputBase {
  assetId: number;
  intoAssetId: number;
  reimbursable?: ReimbursableValue;
}

export type CreateRecordInput =
  CreateCashflowRecordInput | CreateTransferRecordInput;
export type UpdateRecordInput =
  UpdateCashflowRecordInput | UpdateTransferRecordInput;

export interface CreateBookInput {
  name: string;
  description?: string;
  background?: string;
}

export interface UpdateBookInput extends CreateBookInput {
  id: number;
}

export interface CreateAssetInput {
  booksId: number;
  name: string;
  balance?: number;
  totalAmount?: number;
  billingDate?: number;
  repaymentDate?: number;
  type: AssetTypeValue;
  classification: AssetClassificationValue;
  invisible?: VisibilityValue;
  openBank?: string;
  cardNo?: string;
  remark?: string;
}

export interface UpdateAssetInput extends CreateAssetInput {
  id: number;
}

export interface CreateAgentMessageInput {
  role: AgentMessageRoleValue;
  message: string;
  usage?: string;
}

export interface AgentThreadDetail {
  thread: AgentThreadRow;
  messages: AgentMessageRow[];
}

export interface AgentProviderModel {
  modelId: string;
  contextWindow: number;
  reasoningEffort: AgentReasoningEffort;
  multimodal: boolean;
}

export interface AgentProviderRow {
  id: number;
  descriptorId: string;
  name: string;
  baseUrl: string;
  defaultModelId: string;
  models: AgentProviderModel[];
  storeResponses: boolean;
  createdTime: number;
  updatedTime: number;
}

export interface AgentSelection {
  providerId: number;
  modelId: string;
}

export interface CreateAgentProviderInput {
  descriptorId: string;
  name: string;
  baseUrl: string;
  defaultModelId?: string;
  models: AgentProviderModel[];
  storeResponses?: boolean;
}

export interface UpdateAgentProviderInput extends CreateAgentProviderInput {
  id: number;
}

export interface QuickTemplateRow {
  id: number;
  booksId: number;
  name: string;
  typeCategory: RecordTypeCategoryValue;
  typeId: number;
  amount: number;
  charge: number;
  remark: string;
  assetId: number;
  intoAssetId: number;
  reimbursable: boolean;
  tagIds: number[];
  icon: string;
  sort: number;
  createdTime: number;
  updatedTime: number;
}

export interface CreateQuickTemplateInput {
  booksId: number;
  name: string;
  typeCategory: RecordTypeCategoryValue;
  typeId: number;
  amount: number;
  charge?: number;
  remark?: string;
  assetId?: number;
  intoAssetId?: number;
  reimbursable?: boolean;
  tagIds?: number[];
  icon?: string;
  sort?: number;
}

export interface UpdateQuickTemplateInput extends CreateQuickTemplateInput {
  id: number;
}

export interface BookSnapshot {
  book: BookRow;
  types: TypeRow[];
  assets: AssetRow[];
  tags: TagRow[];
  records: RecordRow[];
  recordRelations: RecordRelationRow[];
  tagRelations: TagRelationRow[];
  images: ImageRow[];
  quickTemplates: QuickTemplateRow[];
  agentThreads: AgentThreadRow[];
  agentMessages: AgentMessageRow[];
}

export interface LibrarySnapshot {
  books: BookSnapshot[];
}

export interface BuildSnapshotOptions {
  includeAgent?: boolean;
}

export interface SnapshotIdMaps {
  types: Map<number, number>;
  assets: Map<number, number>;
  tags: Map<number, number>;
  records: Map<number, number>;
  threads: Map<number, number>;
}

export interface ApplySnapshotOptions {
  bookName?: string;
  mapAgentMessage?: (
    message: AgentMessageRow,
    maps: SnapshotIdMaps,
  ) => AgentMessageRow;
}

export interface SnapshotCounts {
  types: number;
  assets: number;
  tags: number;
  records: number;
  recordRelations: number;
  tagRelations: number;
  images: number;
  quickTemplates: number;
  agentThreads: number;
  agentMessages: number;
}

export interface ApplyBookSnapshotResult {
  bookId: number;
  name: string;
  counts: SnapshotCounts;
}

export interface ApplyLibrarySnapshotResult {
  books: ApplyBookSnapshotResult[];
}

export interface AiConfigProvider {
  id: number;
  descriptorId: string;
  name: string;
  baseUrl: string;
  defaultModelId: string;
  models: AgentProviderModel[];
  storeResponses: boolean;
  apiKey: string;
}

export interface AiConfigSnapshot {
  providers: AiConfigProvider[];
  agentSelection: AgentSelection;
  quickBookSelection: AgentSelection;
}

export interface ApplyAiConfigResult {
  providerIdMap: Record<number, number>;
  providersCreated: number;
  providersUpdated: number;
  threadsUpdated: number;
  keysUpdated: number;
}

export type { AgentReasoningEffort, AgentSelectionScope };
