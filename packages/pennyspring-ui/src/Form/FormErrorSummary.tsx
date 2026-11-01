import React from 'react';
import { useSelector } from '@tanstack/react-form';
import { useTheme } from '@pennyspring/theme';
import { Column } from '../Column';
import { Text } from '../Text';
import { renderTextNode } from '../shares/node';
import { useFormInstance } from './hooks/useFormInstance.ts';
import { getFormErrorMessages } from './utils/formError.ts';
import type { FormErrorSummaryProps, FormState, FormValues } from './types';

export function FormErrorSummary({
  title,
  renderMessage,
  style,
}: FormErrorSummaryProps) {
  const { token } = useTheme();
  const form = useFormInstance();
  const errorMap = useSelector(
    form.store as never,
    (state: FormState<FormValues>) => state.errorMap,
  ) as unknown as Record<string, unknown>;
  const fieldMeta = useSelector(
    form.store as never,
    (state: FormState<FormValues>) => state.fieldMeta,
  ) as unknown as Record<string, unknown>;
  const fieldNames = new Set(Object.keys(fieldMeta));
  const messages = getFormErrorMessages(errorMap, fieldNames);

  if (messages.length === 0) {
    return null;
  }

  return (
    <Column gap={token.marginXXS} style={style} testID="form-error-summary">
      {title !== null && title !== undefined
        ? renderTextNode(title, text => (
            <Text color="description" size="sm">
              {text}
            </Text>
          ))
        : null}
      {messages.map(message => (
        <React.Fragment key={message}>
          {renderMessage !== undefined ? (
            renderTextNode(renderMessage(message), text => (
              <Text color="error" size="sm" testID="form-error-summary-item">
                {text}
              </Text>
            ))
          ) : (
            <Text color="error" size="sm" testID="form-error-summary-item">
              {message}
            </Text>
          )}
        </React.Fragment>
      ))}
    </Column>
  );
}
