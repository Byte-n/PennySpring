import React, { useState } from 'react';
import { useField, useSelector } from '@tanstack/react-form';
import { useTheme } from '@pennyspring/theme';
import { Column } from '../Column';
import { Row } from '../Row';
import { Text } from '../Text';
import { renderTextNode } from '../shares/node';
import { useFormContext } from './FormContext.ts';
import { FormItemContext } from './FormItemContext.ts';
import { FormItemScope } from './FormItemScope.tsx';
import { useFieldProps } from './hooks/useFieldProps.ts';
import { useFieldState } from './hooks/useFieldState.ts';
import { getFieldErrorMessage } from './utils/fieldError.ts';
import { normalizeRules } from './utils/normalizeRules.ts';
import { normalizeValidateTrigger } from './utils/normalizeValidateTrigger.ts';
import { useFormItemStyles } from './style';
import type { FormItemProps, FormValues } from './types';
import type { FormItemContextValue } from './utils/types.ts';
import type { DeepKeys } from '@tanstack/react-form';

interface RuntimeFieldApi {
  state: {
    value: unknown;
    meta: {
      errors: readonly unknown[];
      isTouched: boolean;
      isValid: boolean;
    };
  };
  handleChange: (value: unknown) => void;
  handleBlur: () => void;
}

const REQUIRED_MARK = '*';

function FormItemRoot<
  TValues extends object = FormValues,
  TName extends DeepKeys<TValues> = DeepKeys<TValues>,
>({
  name,
  labelText,
  label,
  required,
  requiredMessage,
  rules,
  dependencies,
  labelMode,
  noStyle = false,
  labelWidth,
  validateTrigger,
  asyncDebounceMs,
  extraText,
  extra,
  errorRender,
  children,
}: FormItemProps<TValues, TName>) {
  const formContext = useFormContext();
  const { token } = useTheme();
  const resolvedLabelWidth = labelWidth ?? formContext.labelWidth;

  const resolvedLabelMode = noStyle
    ? 'item'
    : labelMode ?? formContext.labelMode;
  const resolvedTriggers = normalizeValidateTrigger(
    validateTrigger ?? formContext.validateTrigger,
  );
  const fieldName = String(name);
  const submissionAttempts = useSelector(
    formContext.form.store as never,
    (state: { submissionAttempts: number }) => state.submissionAttempts,
  ) as number;
  const hasSubmitted = submissionAttempts > 0;
  const validators = normalizeRules(rules, resolvedTriggers, fieldName, {
    dependencies,
    required,
    requiredMessage:
      requiredMessage ?? (labelText ? `请填写${labelText}` : undefined),
    revalidateOnChangeAfterSubmit: hasSubmitted,
    asyncDebounceMs,
  });
  const field = useField({
    form: formContext.form as never,
    name: name as never,
    validators: validators as never,
    asyncDebounceMs,
  }) as unknown as RuntimeFieldApi;
  const [hasTriggered, setHasTriggered] = useState(false);

  const styles = useFormItemStyles({
    labelWidth: resolvedLabelWidth,
    layout: formContext.layout,
  });

  const handleChange = (nextValue: unknown): void => {
    field.handleChange(nextValue);

    if (resolvedTriggers.includes('onChange')) {
      setHasTriggered(true);
    }
  };

  const handleBlur = (): void => {
    field.handleBlur();

    if (resolvedTriggers.includes('onBlur')) {
      setHasTriggered(true);
    }
  };

  const visibleError =
    hasTriggered || hasSubmitted
      ? getFieldErrorMessage(field.state.meta.errors)
      : undefined;
  const resolvedLabel = label === null ? null : label ?? labelText ?? null;
  const isItemLabelMode = !noStyle && resolvedLabelMode === 'item';
  const showItemLabel = isItemLabelMode && resolvedLabel !== null;
  const showRequiredMark =
    showItemLabel && required === true && formContext.requiredMark;
  const controlLabel =
    !noStyle && resolvedLabelMode === 'child' && label !== null
      ? { label, labelText }
      : null;

  const contextValue: FormItemContextValue = {
    name: fieldName,
    value: field.state.value,
    onChange: handleChange,
    onBlur: handleBlur,
    disabled: formContext.disabled,
    readonly: formContext.readonly,
    status: visibleError === undefined ? undefined : 'error',
    isTouched: field.state.meta.isTouched,
    isValid: field.state.meta.isValid,
    controlLabel,
  };

  const errorNode =
    visibleError === undefined
      ? null
      : errorRender !== undefined
        ? renderTextNode(errorRender(visibleError), text => (
            <Text color="error" size="sm">
              {text}
            </Text>
          ))
        : (
            <Text color="error" size="sm" testID="form-item-error">
              {visibleError}
            </Text>
          );

  const resolvedExtra = extra === null ? null : extra ?? extraText ?? null;
  const extraNode =
    !noStyle && resolvedExtra !== null
      ? renderTextNode(resolvedExtra, text => (
          <Text color="description" size="sm" testID="form-item-extra">
            {text}
          </Text>
        ))
      : null;

  const labelNode = showItemLabel ? (
    <Row
      align="center"
      gap={token.marginXXS}
      justify={formContext.labelAlign === 'right' ? 'end' : 'start'}
      testID="form-item-label"
    >
      {renderTextNode(resolvedLabel, text => (
        <Text color="description" size="sm">
          {text}
        </Text>
      ))}
      {showRequiredMark ? (
        <Text color="error" size="sm" testID="form-item-required">
          {REQUIRED_MARK}
        </Text>
      ) : null}
    </Row>
  ) : null;

  if (noStyle) {
    return (
      <FormItemContext.Provider value={contextValue}>
        {children}
        {errorNode}
      </FormItemContext.Provider>
    );
  }

  if (formContext.layout === 'horizontal') {
    const showLabelColumn =
      isItemLabelMode &&
      (showItemLabel || resolvedLabelWidth !== undefined);

    return (
      <FormItemContext.Provider value={contextValue}>
        <Row align="start" gap={token.marginSM} testID="form-item-root">
          {showLabelColumn ? (
            <Column
              align={formContext.labelAlign === 'right' ? 'end' : 'start'}
              style={styles.labelColumn}
              testID="form-item-label-column"
            >
              {labelNode}
            </Column>
          ) : null}
          <Column style={styles.content} testID="form-item-content">
            {children}
            {errorNode}
            {extraNode}
          </Column>
        </Row>
      </FormItemContext.Provider>
    );
  }

  return (
    <FormItemContext.Provider value={contextValue}>
      <Column style={styles.root} testID="form-item-root">
        {labelNode}
        {children}
        {errorNode}
        {extraNode}
      </Column>
    </FormItemContext.Provider>
  );
}

export const FormItem = Object.assign(FormItemRoot, {
  Scope: FormItemScope,
  useFieldState,
  useFieldProps,
});
