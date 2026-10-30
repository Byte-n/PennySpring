import type { FormValidateTrigger } from '../types.ts';

const DEFAULT_VALIDATE_TRIGGERS: FormValidateTrigger[] = ['onChange'];

const SUPPORTED_TRIGGERS: FormValidateTrigger[] = [
  'onChange',
  'onBlur',
  'onSubmit',
];

function isValidateTrigger(value: string): value is FormValidateTrigger {
  return (SUPPORTED_TRIGGERS as string[]).includes(value);
}

export function normalizeValidateTrigger(
  value?: FormValidateTrigger | FormValidateTrigger[],
): FormValidateTrigger[] {
  if (value === undefined) {
    return DEFAULT_VALIDATE_TRIGGERS;
  }

  const list = Array.isArray(value) ? value : [value];
  const result: FormValidateTrigger[] = [];

  for (const trigger of list) {
    if (isValidateTrigger(trigger) && !result.includes(trigger)) {
      result.push(trigger);
    }
  }

  return result.length === 0 ? DEFAULT_VALIDATE_TRIGGERS : result;
}
