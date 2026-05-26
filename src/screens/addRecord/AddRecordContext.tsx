import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ImagePickerValue } from '@pennyspring/ui';

export interface AddRecordContextValue {
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
  reset: () => void;
}

const AddRecordContext = createContext<AddRecordContextValue | null>(null);

interface AddRecordProviderProps {
  children: React.ReactNode;
}

export function AddRecordProvider({ children }: AddRecordProviderProps) {
  const [amount, setAmount] = useState(0);
  const [remark, setRemark] = useState('');
  const [recordTime, setRecordTime] = useState(() => Date.now());
  const [tags, setTags] = useState<number[]>([]);
  const [images, setImages] = useState<ImagePickerValue[]>([]);
  const reset = useCallback(() => {
    setAmount(0);
    setRemark('');
    setRecordTime(Date.now());
    setTags([]);
    setImages([]);
  }, []);

  const value = useMemo<AddRecordContextValue>(
    () => ({
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
      reset,
    }),
    [amount, images, recordTime, remark, reset, tags]
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
