import type { InferSelectModel } from 'drizzle-orm';

import type {
  AgentMessageRoleValue,
  AgentReasoningEffort,
  AgentSelectionScope,
  AssetClassificationValue,
  AssetTypeValue,
  QuickBookDraftSourceValue,
  QuickBookDraftStatusValue,
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

/** 草稿单笔状态：待确认 / 已写入记录。 */
export type DraftItemStatus = 'pending' | 'confirmed';

/** 截图记账草稿的逐笔内容，金额统一以分存储。 */
export interface DraftItem {
  status: DraftItemStatus;
  /** 0 表示尚未写入记录；写入后关联 tb_record.id */
  recordId: number;
  /** 0 表示未选择类型 */
  typeId: number;
  /** 展示兜底，不参与写入 */
  typeName: string;
  /** null 表示金额待确认 */
  amountCents: number | null;
  recordTime: number;
  remark: string;
  assetId: number;
  assetName: string;
  intoAssetId: number;
  intoAssetName: string;
  chargeCents: number;
  /** 一期为空数组，预留 */
  tagIds: number[];
  reimbursable: boolean;
  warnings: string[];
}

/** 草稿组预设；0 表示未指定。 */
export interface QuickBookDraftPreset {
  assetId: number;
  typeId: number;
}

/** 草稿组（设备级中间态），payload 与 preset 已解析为结构化字段。 */
export interface QuickBookDraftRow {
  id: string;
  booksId: number;
  status: QuickBookDraftStatusValue;
  source: QuickBookDraftSourceValue;
  imagePath: string;
  items: DraftItem[];
  preset: QuickBookDraftPreset;
  agentProviderId: number;
  agentModelId: string;
  agentSummary: string;
  errorText: string;
  confirmedCount: number;
  recordIds: number[];
  createdTime: number;
  updatedTime: number;
  confirmedAt: number;
}

export interface CreateQuickBookDraftPlaceholderInput {
  /** 设备侧生成的 UUID；同一 id 重新生成会重置草稿 */
  id: string;
  booksId: number;
  imagePath: string;
  source?: QuickBookDraftSourceValue;
  preset?: Partial<QuickBookDraftPreset>;
  agentProviderId?: number;
  agentModelId?: string;
}

export interface QuickBookDraftListFilter {
  /** 默认仅 generating / pending / failed */
  statuses?: QuickBookDraftStatusValue[];
  booksId?: number;
}

/** 更新草稿内容时可选写入的 Agent 诊断信息；未提供的字段保持原值。 */
export interface QuickBookDraftUpdateMeta {
  agentSummary?: string;
  agentProviderId?: number;
  agentModelId?: string;
}

export interface ConfirmQuickBookDraftItemResult {
  item: DraftItem;
  recordId: number;
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
