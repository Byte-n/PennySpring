import { createContext, useContext } from 'react';
import type {
  FormInstance,
  FormLabelAlign,
  FormLabelMode,
  FormLayout,
  FormValidateTrigger,
  FormValues,
} from './types.ts';

export interface FormContextValue<TValues extends object = FormValues> {
  form: FormInstance<TValues>;
  layout: FormLayout;
  labelMode: FormLabelMode;
  labelWidth?: number;
  labelAlign: FormLabelAlign;
  requiredMark: boolean;
  validateTrigger: FormValidateTrigger[];
  disabled?: boolean;
  readonly?: boolean;
}

export const FormContext = createContext<FormContextValue | null>(null);

export function useFormContext<TValues extends object = FormValues>(): FormContextValue<TValues> {
  const context = useContext(FormContext);

  if (context === null) {
    throw new Error('Form.useFormInstance 必须在 <Form> 内使用');
  }

  return context as unknown as FormContextValue<TValues>;
}
