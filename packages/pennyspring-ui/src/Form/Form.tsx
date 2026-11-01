import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { useForm as useTanStackForm, useSelector } from '@tanstack/react-form';
import { useTheme } from '@pennyspring/theme';
import { Column } from '../Column';
import { FormContext } from './FormContext.ts';
import { FormErrorSummary } from './FormErrorSummary';
import { FormItem } from './FormItem';
import { FormList } from './FormList';
import { FormSubscribe } from './FormSubscribe';
import { useFormInstance } from './hooks/useFormInstance.ts';
import { diffValues } from './utils/diffValues.ts';
import { getFieldErrorMessages } from './utils/fieldError.ts';
import { normalizeValidateTrigger } from './utils/normalizeValidateTrigger.ts';
import type {
  FormErrorSummaryProps,
  FormFinishFailedInfo,
  FormInstance,
  FormItemProps,
  FormListProps,
  FormOptions,
  FormProps,
  FormState,
  FormSubscribeProps,
  FormValues,
} from './types';
import type { DeepKeys } from '@tanstack/react-form';

// 勿给导入的 hook 建模块级运行时别名：Metro inlineRequires 会把它内联成独立 CJS 依赖，导致同一个包出现两份实例。
type InternalFormHook = <TValues extends object>(
  options?: FormOptions<TValues>,
) => FormInstance<TValues>;

function useInternalForm<TValues extends object>(
  options?: FormOptions<TValues>,
): FormInstance<TValues> {
  return (useTanStackForm as unknown as InternalFormHook)<TValues>(options);
}

type BoundFormItem<TValues extends object> = (<TName extends DeepKeys<TValues>>(
  props: FormItemProps<TValues, TName>,
) => React.ReactElement) & {
  Scope: typeof FormItem.Scope;
  useFieldState: typeof FormItem.useFieldState;
  useFieldProps: typeof FormItem.useFieldProps;
};

interface FormBehaviorProps<TValues extends object> {
  beforeSubmit?: FormProps<TValues>['beforeSubmit'];
  onFinish?: FormProps<TValues>['onFinish'];
  onFinishFailed?: FormProps<TValues>['onFinishFailed'];
}

function createFinishFailedInfo<TValues extends object>(
  formApi: FormInstance<TValues>,
  values: TValues,
): FormFinishFailedInfo<TValues> {
  const fieldMeta = formApi.state.fieldMeta as unknown as Record<
    string,
    { errors: readonly unknown[] }
  >;
  const errorFields = Object.entries(fieldMeta).flatMap(([name, meta]) => {
    const errors = getFieldErrorMessages(meta.errors);

    return errors.length > 0 ? [{ name, errors }] : [];
  });

  return { values, errorFields };
}

function createFormBehaviorOptions<TValues extends object>({
  beforeSubmit,
  onFinish,
  onFinishFailed,
}: FormBehaviorProps<TValues>): Pick<
  FormOptions<TValues>,
  'onSubmit' | 'onSubmitInvalid'
> {
  return {
    onSubmit: async ({ value, formApi }) => {
      const currentValues = value as TValues;
      const nextValues = beforeSubmit
        ? await beforeSubmit(currentValues)
        : currentValues;

      if (nextValues !== currentValues) {
        for (const key of Object.keys(nextValues) as Array<keyof TValues>) {
          if (nextValues[key] !== currentValues[key]) {
            formApi.setFieldValue(key as never, nextValues[key] as never);
          }
        }
      }

      await onFinish?.(nextValues);
    },
    onSubmitInvalid: ({ value, formApi }) => {
      onFinishFailed?.(
        createFinishFailedInfo(
          formApi as unknown as FormInstance<TValues>,
          value as TValues,
        ),
      );
    },
  };
}

function useValuesChange<TValues extends object>(
  form: FormInstance<TValues>,
  onValuesChange?: FormProps<TValues>['onValuesChange'],
): void {
  const previousValuesRef = useRef(form.state.values as TValues);
  const onValuesChangeRef = useRef(onValuesChange);

  useEffect(() => {
    onValuesChangeRef.current = onValuesChange;
  });

  useEffect(() => {
    previousValuesRef.current = form.state.values as TValues;

    const subscription = form.store.subscribe(() => {
      const nextValues = form.state.values as TValues;

      // The store also notifies for meta/validating changes; only diff values.
      if (nextValues === previousValuesRef.current) {
        return;
      }

      const result = diffValues(previousValuesRef.current, nextValues);

      previousValuesRef.current = nextValues;

      if (result.changed) {
        onValuesChangeRef.current?.(
          result.value as Partial<TValues>,
          nextValues,
        );
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);
}

function useForm<TValues extends object = FormValues>(
  form?: FormInstance<TValues>,
): [FormInstance<TValues>] {
  const internalForm = useInternalForm<TValues>();

  return [form ?? internalForm];
}

function useFormState<TValues extends object, TSelected>(
  selector: (state: FormState<TValues>) => TSelected,
): TSelected {
  const form = useFormInstance<TValues>();

  return useSelector(form.store as never, selector as never) as TSelected;
}

type FormViewProps<TValues extends object> = Omit<
  FormProps<TValues>,
  'form' | 'initialValues' | 'beforeSubmit' | 'onFinish' | 'onFinishFailed'
> & {
  form: FormInstance<TValues>;
};

function FormView<TValues extends object>({
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
  onValuesChange,
  style,
  children,
}: FormViewProps<TValues>) {
  const { token } = useTheme();
  const resolvedValidateTrigger = normalizeValidateTrigger(validateTrigger);

  useValuesChange(form, onValuesChange);

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

function InternalForm<TValues extends object>({
  initialValues,
  beforeSubmit,
  onFinish,
  onFinishFailed,
  form: _form,
  ...viewProps
}: FormProps<TValues>) {
  const form = useInternalForm<TValues>({
    defaultValues: initialValues,
    ...createFormBehaviorOptions({ beforeSubmit, onFinish, onFinishFailed }),
  });

  return <FormView form={form} {...viewProps} />;
}

function ExternalForm<TValues extends object>({
  form,
  initialValues,
  beforeSubmit,
  onFinish,
  onFinishFailed,
  ...viewProps
}: FormProps<TValues> & { form: FormInstance<TValues> }) {
  useLayoutEffect(() => {
    // form.update replaces the whole options object, so existing options must
    // be merged in rather than overwritten.
    const nextOptions = {
      ...form.options,
      ...createFormBehaviorOptions({ beforeSubmit, onFinish, onFinishFailed }),
      ...(initialValues !== undefined
        ? { defaultValues: initialValues }
        : undefined),
    } as FormOptions<TValues>;

    form.update(nextOptions);
  }, [form, initialValues, beforeSubmit, onFinish, onFinishFailed]);

  return <FormView form={form} {...viewProps} />;
}

// Split so useTanStackForm only runs when the Form owns the instance (hooks
// cannot be conditional). Merging would create an unused store per external form.
function FormRoot<TValues extends object = FormValues>(
  props: FormProps<TValues>,
) {
  return props.form === undefined ? (
    <InternalForm {...props} />
  ) : (
    <ExternalForm {...props} form={props.form} />
  );
}

export const Form = Object.assign(FormRoot, {
  Item: FormItem,
  List: FormList,
  Subscribe: FormSubscribe,
  ErrorSummary: FormErrorSummary,
  useForm,
  useFormInstance,
  useFormState,
  infer,
});

export interface BoundForm<TValues extends object> {
  (props: FormProps<TValues>): React.ReactElement;
  Item: BoundFormItem<TValues>;
  List: <TName extends DeepKeys<TValues>>(
    props: FormListProps<TValues, TName>,
  ) => React.ReactElement;
  Subscribe: <TSelected>(
    props: FormSubscribeProps<TValues, TSelected>,
  ) => React.JSX.Element;
  ErrorSummary: (props: FormErrorSummaryProps) => React.ReactElement;
  useForm: (form?: FormInstance<TValues>) => [FormInstance<TValues>];
  useFormInstance: () => FormInstance<TValues>;
  useFormState: <TSelected>(
    selector: (state: FormState<TValues>) => TSelected,
  ) => TSelected;
}

export function infer<TValues extends object>(): BoundForm<TValues> {
  return Form as unknown as BoundForm<TValues>;
}
