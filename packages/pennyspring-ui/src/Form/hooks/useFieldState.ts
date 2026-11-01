import { useFormItemContext } from '../FormItemContext.ts';
import type { FormFieldState } from '../types.ts';

export function useFieldState<
  TValue = unknown,
>(): FormFieldState<TValue> | null {
  return useFormItemContext<TValue>();
}
