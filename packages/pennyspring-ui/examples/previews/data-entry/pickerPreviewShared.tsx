import React from 'react';
import { Column, Text } from '@pennyspring/ui';
import { useTheme } from '@pennyspring/theme';
import type { ReactNode } from 'react';

interface PreviewStackProps {
  children?: ReactNode;
}

interface TriggerContentProps {
  label: string;
  value: string;
  meta?: string;
}

interface InlineValueProps {
  label: string;
  value: string;
}

export function PreviewStack({ children }: PreviewStackProps) {
  const { token } = useTheme();

  return <Column gap={token.marginSM}>{children}</Column>;
}

export function TriggerContent({ label, meta, value }: TriggerContentProps) {
  const { token } = useTheme();

  return (
    <Column gap={token.marginXXS}>
      <Text color="description" size="sm">{label}</Text>
      <Text color="heading" weight="strong">{value}</Text>
      {meta ? <Text color="description" size="sm">{meta}</Text> : null}
    </Column>
  );
}

export function InlineValue({ label, value }: InlineValueProps) {
  return (
    <Text color="description" size="sm">
      {label}: {value}
    </Text>
  );
}

export function joinLabels(labels: Array<string | undefined>): string {
  const visibleLabels = labels.filter((label): label is string =>
    label !== undefined && label.length > 0,
  );

  if (visibleLabels.length === 0) {
    return 'None';
  }

  return visibleLabels.join(' / ');
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function formatDateTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${formatDate(date)} ${hours}:${minutes}`;
}

export function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
}
