import React, { createContext, useContext, useMemo, useState } from 'react';

export interface AddRecordContextValue {
  amount: number;
  setAmount: (v: number) => void;
  remark: string;
  setRemark: (v: string) => void;
  recordTime: number;
  setRecordTime: (v: number) => void;
  tags: number[];
  setTags: (v: number[]) => void;
  images: string[];
  setImages: (v: string[]) => void;
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
  const [images, setImages] = useState<string[]>([]);

  const value = useMemo<AddRecordContextValue>(
    () => ({ amount, setAmount, remark, setRemark, recordTime, setRecordTime, tags, setTags, images, setImages }),
    [amount, remark, recordTime, tags, images]
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
