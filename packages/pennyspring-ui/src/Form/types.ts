import type { DeepKeys, DeepValue } from '@tanstack/react-form';
import type {
  FormAsyncValidateOrFn,
  FormOptions as TanStackFormOptions,
  FormState as TanStackFormState,
  FormValidateOrFn,
  ReactFormExtendedApi,
  StandardSchemaV1,
} from '@tanstack/react-form';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export type FormValues = Record<string, unknown>;
export type FormLabelMode = 'item' | 'child';
export type FormLayout = 'vertical' | 'horizontal';
export type FormLabelAlign = 'left' | 'right';
export type FormValidateTrigger = 'onChange' | 'onBlur' | 'onSubmit';
export type FormFieldStatus = 'default' | 'error' | 'warning' | 'success';

export type FormItemRule<TValue, TValues extends object> =
  | StandardSchemaV1<TValue>
  | ((
      value: TValue,
      context: { values: TValues; name: string },
    ) => string | undefined | Promise<string | undefined>);

export type FormItemRules<TValue, TValues extends object> =
  | FormItemRule<TValue, TValues>
  | readonly FormItemRule<TValue, TValues>[];

export type FormBeforeSubmit<TValues extends object = FormValues> = (
  values: TValues,
) => TValues | Promise<TValues>;

export type FormListItem<
  TValues extends object,
  TName extends DeepKeys<TValues>,
> = DeepValue<TValues, TName> extends readonly (infer TItem)[] ? TItem : never;

type FormSyncValidator<TValues extends object> =
  | FormValidateOrFn<TValues>
  | undefined;

type FormAsyncValidator<TValues extends object> =
  | FormAsyncValidateOrFn<TValues>
  | undefined;

/**
 * Form instance returned by Form.useForm. Validator slots are erased to the
 * sync/async validator unions instead of TanStack's per-slot inference.
 */
export type FormInstance<TValues extends object = FormValues> = ReactFormExtendedApi<
  TValues,
  FormSyncValidator<TValues>,
  FormSyncValidator<TValues>,
  FormAsyncValidator<TValues>,
  FormSyncValidator<TValues>,
  FormAsyncValidator<TValues>,
  FormSyncValidator<TValues>,
  FormAsyncValidator<TValues>,
  FormSyncValidator<TValues>,
  FormAsyncValidator<TValues>,
  FormAsyncValidator<TValues>,
  never
>;

export type FormOptions<TValues extends object = FormValues> = TanStackFormOptions<
  TValues,
  FormSyncValidator<TValues>,
  FormSyncValidator<TValues>,
  FormAsyncValidator<TValues>,
  FormSyncValidator<TValues>,
  FormAsyncValidator<TValues>,
  FormSyncValidator<TValues>,
  FormAsyncValidator<TValues>,
  FormSyncValidator<TValues>,
  FormAsyncValidator<TValues>,
  FormAsyncValidator<TValues>,
  never
>;

export type FormState<TValues extends object = FormValues> = TanStackFormState<
  TValues,
  FormSyncValidator<TValues>,
  FormSyncValidator<TValues>,
  FormAsyncValidator<TValues>,
  FormSyncValidator<TValues>,
  FormAsyncValidator<TValues>,
  FormSyncValidator<TValues>,
  FormAsyncValidator<TValues>,
  FormSyncValidator<TValues>,
  FormAsyncValidator<TValues>,
  FormAsyncValidator<TValues>
>;

export interface FormFinishFailedField {
  name: string;
  errors: string[];
}

export interface FormFinishFailedInfo<TValues extends object = FormValues> {
  values: TValues;
  errorFields: FormFinishFailedField[];
}

export interface FormProps<TValues extends object = FormValues> {
  form?: FormInstance<TValues>;
  initialValues?: TValues;
  layout?: FormLayout;
  labelMode?: FormLabelMode;
  labelWidth?: number;
  labelAlign?: FormLabelAlign;
  gap?: number;
  requiredMark?: boolean;
  validateTrigger?: FormValidateTrigger | FormValidateTrigger[];
  disabled?: boolean;
  readonly?: boolean;
  /**
   * 校验通过后、onFinish 之前执行；返回的新值会写回表单以供重试使用。
   * 抛错会中止提交，并让 handleSubmit 返回的 Promise reject。
   */
  beforeSubmit?: FormBeforeSubmit<TValues>;
  onFinish?: (values: TValues) => void | Promise<void>;
  onFinishFailed?: (errorInfo: FormFinishFailedInfo<TValues>) => void;
  onValuesChange?: (
    changedValues: Partial<TValues>,
    allValues: TValues,
  ) => void;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

export interface FormItemProps<
  TValues extends object = FormValues,
  TName extends DeepKeys<TValues> = DeepKeys<TValues>,
> {
  name: TName;
  labelText?: string;
  label?: ReactNode | null;
  required?: boolean;
  requiredMessage?: string;
  rules?: FormItemRules<DeepValue<TValues, TName>, TValues>;
  dependencies?: DeepKeys<TValues>[];
  labelMode?: FormLabelMode;
  noStyle?: boolean;
  labelWidth?: number;
  validateTrigger?: FormValidateTrigger | FormValidateTrigger[];
  asyncDebounceMs?: number;
  extraText?: string;
  extra?: ReactNode | null;
  errorRender?: (message: string) => ReactNode;
  children: ReactNode;
}

export interface FormListField<TValues extends object = FormValues> {
  key: number;
  index: number;
  name: (subName: string) => DeepKeys<TValues>;
}

export interface FormListOperations<
  TValues extends object = FormValues,
  TName extends DeepKeys<TValues> = DeepKeys<TValues>,
> {
  add: (value?: FormListItem<TValues, TName>, index?: number) => void;
  remove: (index: number) => void;
  move: (from: number, to: number) => void;
}

export interface FormListProps<
  TValues extends object = FormValues,
  TName extends DeepKeys<TValues> = DeepKeys<TValues>,
> {
  name: TName;
  children: (
    fields: FormListField<TValues>[],
    operations: FormListOperations<TValues, TName>,
  ) => ReactNode;
}

export interface FormErrorSummaryProps {
  title?: ReactNode;
  renderMessage?: (message: string) => ReactNode;
  style?: StyleProp<ViewStyle>;
}

export interface FormSubscribeProps<TValues extends object, TSelected> {
  selector: (state: FormState<TValues>) => TSelected;
  children: ReactNode | ((state: TSelected) => ReactNode);
}

export interface FormItemScopeProps {
  children: ReactNode;
}

export interface FormFieldState<TValue = unknown> {
  name: string;
  value: TValue;
  onChange: (value: TValue) => void;
  onBlur: () => void;
  disabled?: boolean;
  readonly?: boolean;
  status?: FormFieldStatus;
  isTouched: boolean;
  isValid: boolean;
}

export interface FormFieldProps<TValue = unknown, TBlurEvent = unknown> {
  value?: TValue;
  onChange?: (value: TValue) => void;
  onBlur?: (event: TBlurEvent) => void;
  label?: ReactNode | null;
  labelText?: string;
  disabled?: boolean;
  readonly?: boolean;
  status?: FormFieldStatus;
}
