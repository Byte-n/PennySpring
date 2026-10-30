import React from 'react';
import { useForm as useTanStackForm } from '@tanstack/react-form';
import { useTheme } from '@pennyspring/theme';
import { Column } from '../Column';
import { FormContext } from './FormContext.ts';
import { useFormInstance } from './hooks/useFormInstance.ts';
import { normalizeValidateTrigger } from './utils/normalizeValidateTrigger.ts';
import { FormItem } from './FormItem';
import { FormSubscribe } from './FormSubscribe';
import type {
  FormInstance,
  FormItemProps,
  FormOptions,
  FormProps,
  FormSubscribeProps,
  FormValues,
} from './types';
import type { DeepKeys } from '@tanstack/react-form';

type BoundFormItem<TValues extends object> = (<
  TName extends DeepKeys<TValues>,
>(
  props: FormItemProps<TValues, TName>,
) => React.ReactElement) & {
  useFieldState: typeof FormItem.useFieldState;
  useFieldProps: typeof FormItem.useFieldProps;
};

function useForm<TValues extends object = FormValues>(
  options?: FormOptions<TValues>,
): FormInstance<TValues> {
  return useTanStackForm(options);
}

function FormRoot<TValues extends object = FormValues>({
  form,
  layout = 'vertical',
  labelMode = 'item',
  labelWidth,
  labelAlign = 'left',
  gap,
  requiredMark = true,
  validateTrigger,
  disabled,
  readonly,
  style,
  children,
}: FormProps<TValues>) {
  const { token } = useTheme();
  const resolvedValidateTrigger = normalizeValidateTrigger(validateTrigger);

  return (
    <FormContext.Provider
      value={{
        // Context erases the value type; useFormContext restores it at read time.
        form: form as unknown as FormInstance<FormValues>,
        layout,
        labelMode,
        labelWidth,
        labelAlign,
        requiredMark,
        validateTrigger: resolvedValidateTrigger,
        disabled,
        readonly,
      }}
    >
      <Column gap={gap ?? token.marginMD} style={style} testID="form-root">
        {children}
      </Column>
    </FormContext.Provider>
  );
}

export const Form = Object.assign(FormRoot, {
  Item: FormItem,
  Subscribe: FormSubscribe,
  useForm,
  useFormInstance,
  infer,
});

export interface BoundForm<TValues extends object> {
  (props: FormProps<TValues>): React.ReactElement;
  Item: BoundFormItem<TValues>;
  Subscribe: <TSelected>(
    props: FormSubscribeProps<TValues, TSelected>,
  ) => React.JSX.Element;
  useForm: (options?: FormOptions<TValues>) => FormInstance<TValues>;
  useFormInstance: () => FormInstance<TValues>;
}

export function infer<TValues extends object>(): BoundForm<TValues> {
  return Form as unknown as BoundForm<TValues>;
}
