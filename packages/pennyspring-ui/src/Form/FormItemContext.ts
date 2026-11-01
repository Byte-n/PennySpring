import { createContext, useContext } from 'react';
import type { FormItemContextValue } from './utils/types.ts';

export const FormItemContext = createContext<FormItemContextValue | null>(null);

export function useFormItemContext<
  TValue = unknown,
>(): FormItemContextValue<TValue> | null {
  return useContext(FormItemContext) as FormItemContextValue<TValue> | null;
}
