import {
  QUICK_BOOK_DRAFT_STATUS,
  REIMBURSABLE,
  type Api,
  type RecordTypeCategoryValue,
} from '@pennyspring/api';

import {
  draftTargetFromBookRef,
  resolveBookApi,
} from '../../features/quickBookDraft/bookApi';
import { isSameDraftBook } from '../../features/quickBookDraft/draftBook';
import { quickBookDraftCache } from '../../features/quickBookDraft/draftCacheStorage';
import type { MediaStore } from '../../media';
import type { CurrentBookRef } from '../../stores/bookStore';
import type {
  AddRecordInitPayload,
  AddRecordPresetPayload,
  AddRecordTemplatePayload,
} from './AddRecordContext';
import {
  buildAddRecordInitFromDraft,
  type AddRecordDraftInitPayload,
} from './draftPrefill';

export interface AddRecordInitParams {
  recordId?: number;
  preset?: AddRecordPresetPayload;
  template?: boolean;
  templatePayload?: AddRecordTemplatePayload;
  draftId?: string;
  itemIndex?: number;
}

export type AddRecordInitSource =
  | { kind: 'edit'; recordId: number }
  | { kind: 'preset'; preset: AddRecordPresetPayload }
  | { kind: 'template'; templatePayload?: AddRecordTemplatePayload }
  | { kind: 'draft'; draftId: string; itemIndex?: number };

export interface AddRecordInitDeps {
  bookId: number | null;
  currentBookRef: CurrentBookRef | null;
  recordApi: Pick<Api['record'], 'getDetailById'>;
  typeApi: Pick<Api['type'], 'getAll'>;
  media: MediaStore | null;
}

export type AddRecordInitSeed =
  | {
      kind: 'edit';
      payload: AddRecordInitPayload;
      typeCategory?: RecordTypeCategoryValue;
    }
  | {
      kind: 'preset';
      payload: AddRecordPresetPayload;
      typeCategory?: RecordTypeCategoryValue;
    }
  | {
      kind: 'template';
      payload?: AddRecordTemplatePayload;
      typeCategory?: RecordTypeCategoryValue;
    }
  | {
      kind: 'draft';
      payload: AddRecordDraftInitPayload;
      typeCategory?: RecordTypeCategoryValue;
    };

/** 路由参数互斥，按编辑 > 预填 > 模板 > 草稿的优先级解析初始化来源。 */
export function resolveAddRecordInitSource(
  params: AddRecordInitParams,
): AddRecordInitSource | null {
  if (params.recordId !== undefined) {
    return { kind: 'edit', recordId: params.recordId };
  }
  if (params.preset !== undefined) {
    return { kind: 'preset', preset: params.preset };
  }
  if (params.template === true) {
    return { kind: 'template', templatePayload: params.templatePayload };
  }
  if (params.draftId !== undefined) {
    return {
      kind: 'draft',
      draftId: params.draftId,
      itemIndex: params.itemIndex,
    };
  }
  return null;
}

export async function loadAddRecordInitSeed(
  source: AddRecordInitSource,
  deps: AddRecordInitDeps,
): Promise<AddRecordInitSeed> {
  switch (source.kind) {
    case 'edit': {
      const { bookId, recordApi, typeApi, media } = deps;
      if (bookId === null) {
        throw new Error('当前账本未就绪，请稍后重试');
      }
      const [detail, types] = await Promise.all([
        recordApi.getDetailById(source.recordId, bookId),
        typeApi.getAll(bookId),
      ]);
      const typeRow = types.find(type => type.id === detail.record.typeId);
      return {
        kind: 'edit',
        typeCategory: typeRow?.typeCategory,
        payload: {
          editingRecordId: detail.record.id,
          typeId: detail.record.typeId,
          amount: detail.record.amount,
          remark: detail.record.remark,
          recordTime: detail.record.recordTime,
          tags: detail.tagIds,
          images: detail.imagePaths.map(uri =>
            media ? media.resolveSource(uri) : { uri },
          ),
          assetId: detail.record.assetId > 0 ? detail.record.assetId : null,
          intoAssetId:
            detail.record.intoAssetId > 0 ? detail.record.intoAssetId : null,
          charge: detail.record.charge,
          reimbursable:
            detail.record.reimbursable === REIMBURSABLE.reimbursable,
          relatedRecordIds: detail.relatedRecordIds,
        },
      };
    }
    case 'preset': {
      const { bookId, typeApi } = deps;
      if (bookId === null) {
        throw new Error('当前账本未就绪，请稍后重试');
      }
      const types = await typeApi.getAll(bookId);
      const typeRow = types.find(type => type.id === source.preset.typeId);
      return {
        kind: 'preset',
        typeCategory: typeRow?.typeCategory,
        payload: source.preset,
      };
    }
    case 'template': {
      return {
        kind: 'template',
        payload: source.templatePayload,
        typeCategory: source.templatePayload?.typeCategory,
      };
    }
    case 'draft': {
      if (deps.currentBookRef === null) {
        throw new Error('请先选择草稿所属账本');
      }
      // 草稿身份只比较 kind/serverUrl/booksId，名称不参与匹配。
      const currentTarget = draftTargetFromBookRef(deps.currentBookRef, '');
      const draft = await quickBookDraftCache.getById(source.draftId);
      if (!isSameDraftBook(currentTarget, draft.target)) {
        throw new Error('请先切换到草稿所属账本');
      }
      if (draft.status === QUICK_BOOK_DRAFT_STATUS.discarded) {
        throw new Error('草稿已丢弃，无法确认');
      }
      const item =
        source.itemIndex !== undefined
          ? draft.items[source.itemIndex]
          : undefined;
      if (item === undefined || item.status === 'confirmed') {
        throw new Error('草稿内容已更新，请返回草稿详情刷新后重试');
      }
      const draftApi = await resolveBookApi(draft.target);
      const [book, types] = await Promise.all([
        draftApi.book.getById(draft.target.booksId).catch(() => null),
        draftApi.type.getAll(draft.target.booksId),
      ]);
      if (book === null) {
        throw new Error('目标账本已不存在，请丢弃草稿后重新截图');
      }
      const typeRow = types.find(type => type.id === item.typeId);
      const prefill = buildAddRecordInitFromDraft(draft, item, typeRow);
      return {
        kind: 'draft',
        payload: {
          draftId: source.draftId,
          itemIndex: source.itemIndex ?? 0,
          ...prefill,
        },
        typeCategory: prefill.typeCategory,
      };
    }
  }
}

export interface AddRecordInitActions {
  init: (payload: AddRecordInitPayload) => void;
  initFromPreset: (payload: AddRecordPresetPayload) => void;
  initFromTemplate: (payload: AddRecordTemplatePayload) => void;
  initBlankTemplate: () => void;
  initFromDraft: (payload: AddRecordDraftInitPayload) => void;
}

export function applyAddRecordInitSeed(
  seed: AddRecordInitSeed,
  actions: AddRecordInitActions,
): void {
  switch (seed.kind) {
    case 'edit':
      actions.init(seed.payload);
      return;
    case 'preset':
      actions.initFromPreset(seed.payload);
      return;
    case 'template':
      if (seed.payload !== undefined) {
        actions.initFromTemplate(seed.payload);
      } else {
        actions.initBlankTemplate();
      }
      return;
    case 'draft':
      actions.initFromDraft(seed.payload);
      return;
  }
}
