import type { ComponentType } from 'react';

export interface PreviewDemoMeta {
  id: string;
  title: string;
  description?: string;
}

export interface PreviewMeta {
  title: string;
  description: string;
  order: number;
  docId?: string;
  demos: readonly PreviewDemoMeta[];
}

export interface ComponentPreviewItem {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
}

export interface ComponentPreviewSection {
  id: string;
  title: string;
  items: readonly ComponentPreviewItem[];
}

export type ComponentPreviewId = ComponentPreviewItem['id'];
