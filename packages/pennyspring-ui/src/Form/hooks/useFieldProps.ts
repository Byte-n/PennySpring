import { useFormItemContext } from '../FormItemContext.ts';
import type { FormFieldProps } from '../types.ts';

export function useFieldProps<TValue = unknown, TBlurEvent = unknown>(
  props: FormFieldProps<TValue, TBlurEvent>,
): FormFieldProps<TValue, TBlurEvent> {
  const field = useFormItemContext<TValue>();

  if (field === null) {
    return props;
  }

  const value = props.value !== undefined ? props.value : field.value;
  const onChange = (nextValue: TValue): void => {
    field.onChange(nextValue);
    props.onChange?.(nextValue);
  };
  const onBlur = (event: TBlurEvent): void => {
    field.onBlur();
    props.onBlur?.(event);
  };
  const disabled =
    props.disabled !== undefined ? props.disabled : field.disabled;
  const readonly =
    props.readonly !== undefined ? props.readonly : field.readonly;
  const status = props.status !== undefined ? props.status : field.status;

  if (field.controlLabel === null) {
    return {
      ...props,
      value,
      onChange,
      onBlur,
      disabled,
      readonly,
      status,
      label: null,
      labelText: undefined,
    };
  }

  return {
    ...props,
    value,
    onChange,
    onBlur,
    disabled,
    readonly,
    status,
    label: props.label !== undefined ? props.label : field.controlLabel.label,
    labelText:
      props.labelText !== undefined
        ? props.labelText
        : field.controlLabel.labelText,
  };
}
