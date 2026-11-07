import type { RecordTypeCategoryValue } from './constants';
import * as services from './services';
import type {
  AgentSelection,
  AiConfigSnapshot,
  ApplySnapshotOptions,
  BookSnapshot,
  BuildSnapshotOptions,
  ConfirmQuickBookDraftItemResult,
  CreateAgentMessageInput,
  CreateAgentProviderInput,
  CreateAssetInput,
  CreateBookInput,
  CreateQuickBookDraftPlaceholderInput,
  CreateQuickTemplateInput,
  CreateRecordInput,
  CreateTagInput,
  CreateTypeInput,
  DraftItem,
  LibrarySnapshot,
  QuickBookDraftAgentInfo,
  QuickBookDraftItemPatch,
  QuickBookDraftListFilter,
  QuickBookDraftPreset,
  QuickBookDraftRow,
  QuickBookDraftUpdateMeta,
  UpdateAgentProviderInput,
  UpdateAssetInput,
  UpdateBookInput,
  UpdateQuickTemplateInput,
  UpdateRecordInput,
  UpdateTagInput,
  UpdateTypeInput,
} from './services';
import type { Database } from './types';
import type { RecordTimeRange } from './services';

/**
 * createApi：把 services 按 api 形状组装成调度器（1 方法 → 1 service 函数）。
 * 驱动无关：getDatabase 由各适配层（data-rn / data-server）注入，事务边界保留在 services。
 */
export function createApi(getDatabase: () => Promise<Database>) {
  return {
    get: getDatabase,
    record: {
      create: async (input: CreateRecordInput) =>
        services.createRecord(await getDatabase(), input),
      createMany: async (inputs: readonly CreateRecordInput[]) =>
        services.createRecords(await getDatabase(), inputs),
      update: async (input: UpdateRecordInput) =>
        services.updateRecord(await getDatabase(), input),
      updateMany: async (inputs: readonly UpdateRecordInput[]) =>
        services.updateRecords(await getDatabase(), inputs),
      delete: async (recordId: number, booksId: number) =>
        services.deleteRecord(await getDatabase(), recordId, booksId),
      deleteMany: async (recordIds: readonly number[], booksId: number) =>
        services.deleteRecords(await getDatabase(), recordIds, booksId),
      getByBook: async (booksId: number, range?: RecordTimeRange) =>
        services.getRecordsByBook(await getDatabase(), booksId, range),
      getListByBook: async (booksId: number, range?: RecordTimeRange) =>
        services.getRecordListByBook(await getDatabase(), booksId, range),
      getDetailById: async (recordId: number, booksId: number) =>
        services.getRecordDetailById(await getDatabase(), recordId, booksId),
      getImageCounts: async (booksId: number, range?: RecordTimeRange) =>
        services.getImageCountsByBook(await getDatabase(), booksId, range),
      getRecordTags: async (booksId: number, range?: RecordTimeRange) =>
        services.getRecordTagsByBook(await getDatabase(), booksId, range),
      getRelationsByBook: async (booksId: number, range?: RecordTimeRange) =>
        services.getRecordRelationsByBook(await getDatabase(), booksId, range),
    },
    tag: {
      getAll: async (booksId: number, range?: RecordTimeRange) =>
        services.getAllTags(await getDatabase(), booksId, range),
      create: async (input: CreateTagInput) =>
        services.createTag(await getDatabase(), input),
      update: async (input: UpdateTagInput) =>
        services.updateTag(await getDatabase(), input),
      delete: async (tagId: number, booksId: number) =>
        services.deleteTag(await getDatabase(), tagId, booksId),
    },
    type: {
      getAll: async (booksId: number, range?: RecordTimeRange) =>
        services.getAllTypes(await getDatabase(), booksId, range),
      create: async (input: CreateTypeInput) =>
        services.createType(await getDatabase(), input),
      update: async (input: UpdateTypeInput) =>
        services.updateType(await getDatabase(), input),
      delete: async (typeId: number, booksId: number) =>
        services.deleteType(await getDatabase(), typeId, booksId),
      getByCategory: async (
        typeCategory: RecordTypeCategoryValue,
        booksId: number,
      ) =>
        services.getTypesByCategory(await getDatabase(), typeCategory, booksId),
    },
    book: {
      getAll: async () => services.getAllBooks(await getDatabase()),
      getDefault: async () => services.getDefaultBook(await getDatabase()),
      getById: async (bookId: number) =>
        services.getBookById(await getDatabase(), bookId),
      create: async (input: CreateBookInput) =>
        services.createBook(await getDatabase(), input),
      update: async (input: UpdateBookInput) =>
        services.updateBook(await getDatabase(), input),
      delete: async (bookId: number) =>
        services.deleteBook(await getDatabase(), bookId),
    },
    asset: {
      getAll: async (booksId: number) =>
        services.getAllAssets(await getDatabase(), booksId),
      getByBook: async (booksId: number) =>
        services.getAssetsByBook(await getDatabase(), booksId),
      create: async (input: CreateAssetInput) =>
        services.createAsset(await getDatabase(), input),
      update: async (input: UpdateAssetInput) =>
        services.updateAsset(await getDatabase(), input),
      delete: async (assetId: number, booksId: number) =>
        services.deleteAsset(await getDatabase(), assetId, booksId),
    },
    provider: {
      getAll: async () => services.getAllProviders(await getDatabase()),
      getById: async (providerId: number) =>
        services.getProviderById(await getDatabase(), providerId),
      create: async (input: CreateAgentProviderInput) =>
        services.createProvider(await getDatabase(), input),
      update: async (input: UpdateAgentProviderInput) =>
        services.updateProvider(await getDatabase(), input),
      delete: async (providerId: number) =>
        services.deleteProvider(await getDatabase(), providerId),
      getSelection: async () =>
        services.getAgentSelection(await getDatabase(), 'agent'),
      setSelection: async (selection: AgentSelection) =>
        services.setAgentSelection(await getDatabase(), 'agent', selection),
    },
    quickBook: {
      getSelection: async () =>
        services.getAgentSelection(await getDatabase(), 'quickBook'),
      setSelection: async (selection: AgentSelection) =>
        services.setAgentSelection(await getDatabase(), 'quickBook', selection),
    },
    quickBookDraft: {
      createPlaceholder: async (input: CreateQuickBookDraftPlaceholderInput) =>
        services.createQuickBookDraftPlaceholder(await getDatabase(), input),
      getById: async (id: string): Promise<QuickBookDraftRow> =>
        services.getQuickBookDraftById(await getDatabase(), id),
      list: async (
        filter?: QuickBookDraftListFilter,
      ): Promise<QuickBookDraftRow[]> =>
        services.listQuickBookDrafts(await getDatabase(), filter),
      countOpen: async (): Promise<number> =>
        services.countOpenQuickBookDrafts(await getDatabase()),
      updateItems: async (
        id: string,
        items: DraftItem[],
        preset: QuickBookDraftPreset,
        meta?: QuickBookDraftUpdateMeta,
      ): Promise<QuickBookDraftRow> =>
        services.updateQuickBookDraftItems(
          await getDatabase(),
          id,
          items,
          preset,
          meta,
        ),
      setAgent: async (
        id: string,
        info: QuickBookDraftAgentInfo,
      ): Promise<QuickBookDraftRow> =>
        services.setQuickBookDraftAgent(await getDatabase(), id, info),
      markReady: async (id: string): Promise<QuickBookDraftRow> =>
        services.markQuickBookDraftReady(await getDatabase(), id),
      markFailed: async (id: string, errorText: string): Promise<void> =>
        services.markQuickBookDraftFailed(await getDatabase(), id, errorText),
      getItem: async (id: string, itemIndex: number): Promise<DraftItem> =>
        services.getQuickBookDraftItem(await getDatabase(), id, itemIndex),
      updateItem: async (
        id: string,
        itemIndex: number,
        patch: QuickBookDraftItemPatch,
      ): Promise<DraftItem> =>
        services.updateQuickBookDraftItem(
          await getDatabase(),
          id,
          itemIndex,
          patch,
        ),
      setAttachImage: async (
        id: string,
        attachImage: boolean,
      ): Promise<QuickBookDraftRow> =>
        services.setQuickBookDraftAttachImage(
          await getDatabase(),
          id,
          attachImage,
        ),
      confirmItem: async (
        id: string,
        itemIndex: number,
        input?: CreateRecordInput,
      ): Promise<ConfirmQuickBookDraftItemResult> =>
        services.confirmQuickBookDraftItem(
          await getDatabase(),
          id,
          itemIndex,
          input,
        ),
      discard: async (id: string): Promise<string[]> =>
        services.discardQuickBookDraft(await getDatabase(), id),
      cleanup: async (): Promise<string[]> =>
        services.cleanupQuickBookDrafts(await getDatabase()),
    },
    agentConfig: {
      exportConfig: async (booksId: number) =>
        services.buildAiConfigSnapshot(await getDatabase(), booksId),
      importConfig: async (snapshot: AiConfigSnapshot, booksId: number) =>
        services.applyAiConfigSnapshot(await getDatabase(), snapshot, booksId),
    },
    credential: {
      hasKey: async (booksId: number, providerId: number) =>
        services.hasProviderKey(await getDatabase(), booksId, providerId),
      getKey: async (booksId: number, providerId: number) =>
        services.getProviderKey(await getDatabase(), booksId, providerId),
      setKey: async (booksId: number, providerId: number, apiKey: string) =>
        services.setProviderKey(
          await getDatabase(),
          booksId,
          providerId,
          apiKey,
        ),
    },
    quickTemplate: {
      list: async (booksId: number) =>
        services.listQuickTemplates(await getDatabase(), booksId),
      create: async (input: CreateQuickTemplateInput) =>
        services.createQuickTemplate(await getDatabase(), input),
      update: async (input: UpdateQuickTemplateInput) =>
        services.updateQuickTemplate(await getDatabase(), input),
      delete: async (templateId: number, booksId: number) =>
        services.deleteQuickTemplate(await getDatabase(), templateId, booksId),
      reorder: async (booksId: number, templateIds: number[]) =>
        services.reorderQuickTemplates(
          await getDatabase(),
          booksId,
          templateIds,
        ),
    },
    transfer: {
      exportBook: async (booksId: number, options?: BuildSnapshotOptions) =>
        services.buildBookSnapshot(await getDatabase(), booksId, options),
      exportLibrary: async (
        booksIds: number[],
        options?: BuildSnapshotOptions,
      ) =>
        services.buildLibrarySnapshot(await getDatabase(), booksIds, options),
      importBook: async (
        snapshot: BookSnapshot,
        options?: ApplySnapshotOptions,
      ) => services.applyBookSnapshot(await getDatabase(), snapshot, options),
      importLibrary: async (
        snapshot: LibrarySnapshot,
        options?: ApplySnapshotOptions,
      ) =>
        services.applyLibrarySnapshot(await getDatabase(), snapshot, options),
    },
    agent: {
      createThread: async (booksId: number, selection: AgentSelection) =>
        services.createThread(await getDatabase(), booksId, selection),
      listThreads: async (booksId: number) =>
        services.listThreads(await getDatabase(), booksId),
      getLatestThreadWithMessages: async (
        booksId: number,
        selection: AgentSelection,
      ) =>
        services.getLatestThreadWithMessages(
          await getDatabase(),
          booksId,
          selection,
        ),
      getThreadDetail: async (threadId: number) =>
        services.getThreadDetail(await getDatabase(), threadId),
      appendMessages: async (
        threadId: number,
        inputs: CreateAgentMessageInput[],
      ) => services.appendMessages(await getDatabase(), threadId, inputs),
      updateThreadModel: async (threadId: number, selection: AgentSelection) =>
        services.updateThreadModel(await getDatabase(), threadId, selection),
      updateThreadTitle: async (threadId: number, title: string) =>
        services.updateThreadTitle(await getDatabase(), threadId, title),
      deleteThread: async (threadId: number) =>
        services.deleteThread(await getDatabase(), threadId),
    },
  };
}

export type Api = ReturnType<typeof createApi>;
