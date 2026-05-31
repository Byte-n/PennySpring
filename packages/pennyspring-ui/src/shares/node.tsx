import type { ReactNode } from 'react';

export function isPrimitiveContent(
  content: ReactNode,
): content is string | number {
  return typeof content === 'string' || typeof content === 'number';
}

export function renderTextNode(
  content: ReactNode,
  wrap: (text: string | number) => ReactNode,
): ReactNode {
  return isPrimitiveContent(content) ? wrap(content) : content;
}
