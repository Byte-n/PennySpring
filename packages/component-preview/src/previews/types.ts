import type { ComponentType } from 'react';

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
