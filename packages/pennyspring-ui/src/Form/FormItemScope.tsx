import React from 'react';
import { FormItemContext } from './FormItemContext.ts';
import type { FormItemScopeProps } from './types.ts';

export function FormItemScope({ children }: FormItemScopeProps) {
  return (
    <FormItemContext.Provider value={null}>
      {children}
    </FormItemContext.Provider>
  );
}
