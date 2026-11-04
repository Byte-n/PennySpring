import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ImagePickerValue } from '@pennyspring/ui';
import type { RecordTypeCategoryValue } from '@pennyspring/api';

import type {
  AddRecordDraftInitPayload,
  AddRecordDraftTarget,
} from './draftPrefill';

export type AddRecordMode = 'create' | 'edit';

export interface AddRecordInitPayload {
  editingRecordId: number;
  typeId: number;
  amount: number;
  remark: string;
  recordTime: number;
  tags: number[];
  images: ImagePickerValue[];
  assetId: number | null;
  intoAssetId: number | null;
  charge: number;
  reimbursable: boolean;
  relatedRecordIds: number[];
}

/**
 * 快捷模板预填载荷。用于「以模板进入编辑新建」：mode 始终为 create，
 * 不带 editingRecordId，recordTime 由 initFromPreset 取当前时刻。
 */
export interface AddRecordPresetPayload {
  typeId: number;
  amount: number;
  remark: string;
  assetId: number | null;
  intoAssetId: number | null;
  charge: number;
  reimbursable: boolean;
  tagIds: number[];
}

/**
 * 模板编辑载荷。用于「以 AddRecord 复用编辑/新增模板」：
 * 携带 id 表示编辑现有模板；新增模板时不传此载荷。
 * typeCategory 供 AddRecordScreen 决定初始 tab。
 */
export interface AddRecordTemplatePayload {
  id: number;
  name: string;
  typeCategory: RecordTypeCategoryValue;
  typeId: number;
  amount: number;
  charge: number;
  remark: string;
  assetId: number | null;
  intoAssetId: number | null;
  reimbursable: boolean;
  tagIds: number[];
}

export interface AddRecordContextValue {
  mode: AddRecordMode;
  editingRecordId?: number;
  /** 是否处于模板编辑流程（新增/编辑模板） */
  template: boolean;
  /** 草稿预填目标；null 表示普通新增/编辑/模板流程 */
  draftTarget: AddRecordDraftTarget | null;
  /** 编辑模板时携带的模板 id；undefined 表示新增模板 */
  editingTemplateId?: number;
  templateName: string;
  setTemplateName: (v: string) => void;
  reimbursable: boolean;
  setReimbursable: (v: boolean) => void;
  typeId?: number;
  setTypeId: (v: number | undefined) => void;
  amount: number;
  setAmount: (v: number) => void;
  remark: string;
  setRemark: (v: string) => void;
  recordTime: number;
  setRecordTime: (v: number) => void;
  tags: number[];
  setTags: (v: number[]) => void;
  images: ImagePickerValue[];
  setImages: (v: ImagePickerValue[]) => void;
  assetId: number | null;
  setAssetId: (v: number | null) => void;
  intoAssetId: number | null;
  setIntoAssetId: (v: number | null) => void;
  relatedRecordIds: number[];
  setRelatedRecordIds: (v: number[]) => void;
  charge: number;
  setCharge: (v: number) => void;
  init: (payload: AddRecordInitPayload) => void;
  initFromPreset: (payload: AddRecordPresetPayload) => void;
  initFromTemplate: (payload: AddRecordTemplatePayload) => void;
  initBlankTemplate: () => void;
  /** 从截图草稿进入新建记录：只预填表单，不写入记录。 */
  initFromDraft: (payload: AddRecordDraftInitPayload) => void;
  reset: () => void;
  /**
   * 一次性消费「进入新增记录后自动打开金额弹窗」的机会。
   * 只有第一个挂载的金额组件会得到 true。
   */
  consumeAutoOpenAmount: () => boolean;
}

const AddRecordContext = createContext<AddRecordContextValue | null>(null);

interface AddRecordProviderProps {
  autoOpenAmount?: boolean;
  children: React.ReactNode;
}

export function AddRecordProvider({
  autoOpenAmount = false,
  children,
}: AddRecordProviderProps) {
  const [mode, setMode] = useState<AddRecordMode>('create');
  const [editingRecordId, setEditingRecordId] = useState<number>();
  const [template, setTemplate] = useState(false);
  const [draftTarget, setDraftTarget] = useState<AddRecordDraftTarget | null>(
    null,
  );
  const [editingTemplateId, setEditingTemplateId] = useState<number>();
  const [templateName, setTemplateName] = useState('');
  const [reimbursable, setReimbursable] = useState(false);
  const [typeId, setTypeId] = useState<number>();
  const [amount, setAmount] = useState(0);
  const [remark, setRemark] = useState('');
  const [recordTime, setRecordTime] = useState(() => Date.now());
  const [tags, setTags] = useState<number[]>([]);
  const [images, setImages] = useState<ImagePickerValue[]>([]);
  const [assetId, setAssetId] = useState<number | null>(null);
  const [intoAssetId, setIntoAssetId] = useState<number | null>(null);
  const [relatedRecordIds, setRelatedRecordIds] = useState<number[]>([]);
  const [charge, setCharge] = useState(0);
  const autoOpenAmountConsumedRef = useRef(false);

  const consumeAutoOpenAmount = useCallback(() => {
    if (autoOpenAmountConsumedRef.current) {
      return false;
    }

    autoOpenAmountConsumedRef.current = true;
    return autoOpenAmount;
  }, [autoOpenAmount]);

  const reset = useCallback(() => {
    setMode('create');
    setEditingRecordId(undefined);
    setTemplate(false);
    setDraftTarget(null);
    setEditingTemplateId(undefined);
    setTemplateName('');
    setReimbursable(false);
    setTypeId(undefined);
    setAmount(0);
    setRemark('');
    setRecordTime(Date.now());
    setTags([]);
    setImages([]);
    setAssetId(null);
    setIntoAssetId(null);
    setRelatedRecordIds([]);
    setCharge(0);
  }, []);

  const init = useCallback((payload: AddRecordInitPayload) => {
    setMode('edit');
    setEditingRecordId(payload.editingRecordId);
    setTemplate(false);
    setDraftTarget(null);
    setTypeId(payload.typeId);
    setAmount(payload.amount);
    setRemark(payload.remark);
    setRecordTime(payload.recordTime);
    setTags(payload.tags);
    setImages(payload.images);
    setAssetId(payload.assetId);
    setIntoAssetId(payload.intoAssetId);
    setRelatedRecordIds(payload.relatedRecordIds);
    setCharge(payload.charge);
    setReimbursable(payload.reimbursable);
  }, []);

  const initFromPreset = useCallback((payload: AddRecordPresetPayload) => {
    setMode('create');
    setEditingRecordId(undefined);
    setTemplate(false);
    setDraftTarget(null);
    setTypeId(payload.typeId);
    setAmount(payload.amount);
    setRemark(payload.remark);
    setRecordTime(Date.now());
    setTags(payload.tagIds);
    setImages([]);
    setAssetId(payload.assetId);
    setIntoAssetId(payload.intoAssetId);
    setRelatedRecordIds([]);
    setCharge(payload.charge);
    setReimbursable(payload.reimbursable);
  }, []);

  const initFromTemplate = useCallback((payload: AddRecordTemplatePayload) => {
    setMode('create');
    setEditingRecordId(undefined);
    setTemplate(true);
    setDraftTarget(null);
    setEditingTemplateId(payload.id);
    setTemplateName(payload.name);
    setReimbursable(payload.reimbursable);
    setTypeId(payload.typeId);
    setAmount(payload.amount);
    setRemark(payload.remark);
    setTags(payload.tagIds);
    setImages([]);
    setAssetId(payload.assetId);
    setIntoAssetId(payload.intoAssetId);
    setRelatedRecordIds([]);
    setCharge(payload.charge);
    setRecordTime(Date.now());
  }, []);

  const initBlankTemplate = useCallback(() => {
    setMode('create');
    setEditingRecordId(undefined);
    setTemplate(true);
    setDraftTarget(null);
    setEditingTemplateId(undefined);
    setTemplateName('');
    setReimbursable(false);
    setTypeId(undefined);
    setAmount(0);
    setRemark('');
    setTags([]);
    setImages([]);
    setAssetId(null);
    setIntoAssetId(null);
    setRelatedRecordIds([]);
    setCharge(0);
    setRecordTime(Date.now());
  }, []);

  const initFromDraft = useCallback((payload: AddRecordDraftInitPayload) => {
    setMode('create');
    setEditingRecordId(undefined);
    setTemplate(false);
    setEditingTemplateId(undefined);
    setTemplateName('');
    setDraftTarget({
      draftId: payload.draftId,
      itemIndex: payload.itemIndex,
      booksId: payload.booksId,
    });
    setReimbursable(payload.reimbursable);
    setTypeId(payload.typeId);
    setAmount(payload.amount);
    setRemark(payload.remark);
    setRecordTime(payload.recordTime);
    setTags(payload.tagIds);
    setImages(payload.images);
    setAssetId(payload.assetId);
    setIntoAssetId(payload.intoAssetId);
    setRelatedRecordIds([]);
    setCharge(payload.charge);
  }, []);

  const value = useMemo<AddRecordContextValue>(
    () => ({
      mode,
      editingRecordId,
      template,
      draftTarget,
      editingTemplateId,
      templateName,
      setTemplateName,
      reimbursable,
      setReimbursable,
      typeId,
      setTypeId,
      amount,
      setAmount,
      remark,
      setRemark,
      recordTime,
      setRecordTime,
      tags,
      setTags,
      images,
      setImages,
      assetId,
      setAssetId,
      intoAssetId,
      setIntoAssetId,
      relatedRecordIds,
      setRelatedRecordIds,
      charge,
      setCharge,
      init,
      initFromPreset,
      initFromTemplate,
      initBlankTemplate,
      initFromDraft,
      reset,
      consumeAutoOpenAmount,
    }),
    [
      amount,
      assetId,
      charge,
      consumeAutoOpenAmount,
      draftTarget,
      editingRecordId,
      editingTemplateId,
      images,
      init,
      initBlankTemplate,
      initFromDraft,
      initFromPreset,
      initFromTemplate,
      intoAssetId,
      mode,
      recordTime,
      remark,
      reset,
      reimbursable,
      tags,
      relatedRecordIds,
      typeId,
      template,
      templateName,
    ],
  );

  return (
    <AddRecordContext.Provider value={value}>
      {children}
    </AddRecordContext.Provider>
  );
}

export function useAddRecordContext(): AddRecordContextValue {
  const ctx = useContext(AddRecordContext);
  if (ctx === null) {
    throw new Error(
      'useAddRecordContext must be used within AddRecordProvider',
    );
  }
  return ctx;
}
