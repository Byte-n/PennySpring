import React from 'react';
import { useFormContext } from './FormContext.ts';
import type { FormSubscribeProps } from './types.ts';

export function FormSubscribe<TValues extends object, TSelected>({
  selector,
  children,
}: FormSubscribeProps<TValues, TSelected>): React.JSX.Element {
  const { form } = useFormContext<TValues>();

  return <form.Subscribe selector={selector}>{children}</form.Subscribe>;
}
