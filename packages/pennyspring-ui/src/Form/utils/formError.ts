import { getErrorMessage } from './fieldError.ts';

function collectMessages(
  value: unknown,
  fieldNames: ReadonlySet<string>,
  messages: string[],
): void {
  const directMessage = getErrorMessage(value);

  if (directMessage !== undefined) {
    if (!messages.includes(directMessage)) {
      messages.push(directMessage);
    }

    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectMessages(item, fieldNames, messages);
    }

    return;
  }

  if (typeof value !== 'object' || value === null) {
    return;
  }

  if ('form' in value || 'fields' in value) {
    if ('form' in value) {
      collectMessages(value.form, fieldNames, messages);
    }

    return;
  }

  for (const [key, child] of Object.entries(value)) {
    if (fieldNames.has(key)) {
      continue;
    }

    collectMessages(child, fieldNames, messages);
  }
}

export function getFormErrorMessages(
  errorMap: Readonly<Record<string, unknown>>,
  fieldNames: ReadonlySet<string>,
): string[] {
  const messages: string[] = [];

  for (const value of Object.values(errorMap)) {
    collectMessages(value, fieldNames, messages);
  }

  return messages;
}
