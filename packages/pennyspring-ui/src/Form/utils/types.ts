import type { ReactNode } from 'react';
import type { FormFieldState } from '../types.ts';

export interface FormControlLabel {
  label?: ReactNode;
  labelText?: string;
}

export interface FormItemContextValue<
  TValue = unknown,
> extends FormFieldState<TValue> {
  controlLabel: FormControlLabel | null;
}
