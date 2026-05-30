import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ImagePickerValue } from '@pennyspring/ui';

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
}

export interface AddRecordContextValue {
  mode: AddRecordMode;
  editingRecordId?: number;
  initialTypeId?: number;
  initialIntoAssetId?: number | null;
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
  charge: number;
  setCharge: (v: number) => void;
  init: (payload: AddRecordInitPayload) => void;
  reset: () => void;
}

const AddRecordContext = createContext<AddRecordContextValue | null>(null);

interface AddRecordProviderProps {
  children: React.ReactNode;
}

export function AddRecordProvider({ children }: AddRecordProviderProps) {
  const [mode, setMode] = useState<AddRecordMode>('create');
  const [editingRecordId, setEditingRecordId] = useState<number>();
  const [initialTypeId, setInitialTypeId] = useState<number>();
  const [initialIntoAssetId, setInitialIntoAssetId] = useState<number | null>();
  const [amount, setAmount] = useState(0);
  const [remark, setRemark] = useState('');
  const [recordTime, setRecordTime] = useState(() => Date.now());
  const [tags, setTags] = useState<number[]>([]);
  const [images, setImages] = useState<ImagePickerValue[]>([]);
  const [assetId, setAssetId] = useState<number | null>(null);
  const [charge, setCharge] = useState(0);

  const reset = useCallback(() => {
    setMode('create');
    setEditingRecordId(undefined);
    setInitialTypeId(undefined);
    setInitialIntoAssetId(undefined);
    setAmount(0);
    setRemark('');
    setRecordTime(Date.now());
    setTags([]);
    setImages([]);
    setAssetId(null);
    setCharge(0);
  }, []);

  const init = useCallback((payload: AddRecordInitPayload) => {
    setMode('edit');
    setEditingRecordId(payload.editingRecordId);
    setInitialTypeId(payload.typeId);
    setInitialIntoAssetId(payload.intoAssetId);
    setAmount(payload.amount);
    setRemark(payload.remark);
    setRecordTime(payload.recordTime);
    setTags(payload.tags);
    setImages(payload.images);
    setAssetId(payload.assetId);
    setCharge(payload.charge);
  }, []);

  const value = useMemo<AddRecordContextValue>(
    () => ({
      mode,
      editingRecordId,
      initialTypeId,
      initialIntoAssetId,
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
      charge,
      setCharge,
      init,
      reset,
    }),
    [amount, assetId, charge, editingRecordId, images, init, initialIntoAssetId, initialTypeId, mode, recordTime, remark, reset, tags]
  );

  return <AddRecordContext.Provider value={value}>{children}</AddRecordContext.Provider>;
}

export function useAddRecordContext(): AddRecordContextValue {
  const ctx = useContext(AddRecordContext);
  if (ctx === null) {
    throw new Error('useAddRecordContext must be used within AddRecordProvider');
  }
  return ctx;
}
