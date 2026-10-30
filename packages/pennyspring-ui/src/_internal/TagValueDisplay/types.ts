import type { ReactNode } from 'react';
import type { ComponentSize } from '../../shares/types';

export interface TagValueItem {
  labelText?: string;
  label?: ReactNode | null;
  value: string | number;
}

export interface TagDisplayProps {
  maxCount?: number;
  wrap?: boolean;
  closable?: boolean;
}

export interface TagValueDisplayProps {
  items: TagValueItem[];
  size?: ComponentSize;
  tagProps?: TagDisplayProps;
  disabled?: boolean;
  readonly?: boolean;
  onRemove?: (value: string | number) => void;
}
