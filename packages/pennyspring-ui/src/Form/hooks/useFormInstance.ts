import { useFormContext } from '../FormContext.ts';
import type { FormInstance, FormValues } from '../types.ts';

export function useFormInstance<TValues extends object = FormValues>(): FormInstance<TValues> {
  return useFormContext<TValues>().form;
}
