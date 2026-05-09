import React from 'react';
import { Tag } from '@pennyspring/component';
import { PreviewRow, PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import type { TagColor } from '@pennyspring/component';

const SEMANTIC_COLORS: TagColor[] = [
  'default',
  'primary',
  'success',
  'warning',
  'danger',
  'info',
];

const PRESET_COLORS: TagColor[] = [
  'blue',
  'purple',
  'cyan',
  'green',
  'magenta',
  'gold',
];

export function TagPreview() {
  return (
    <PreviewScaffold>
      <PreviewSection title="Semantic colors">
        <PreviewRow>
          {SEMANTIC_COLORS.map(color => (
            <Tag key={color} color={color}>
              {color}
            </Tag>
          ))}
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Variants">
        <PreviewRow>
          <Tag color="primary" variant="filled">Filled</Tag>
          <Tag color="primary" variant="outlined">Outlined</Tag>
          <Tag color="primary" variant="solid">Solid</Tag>
          <Tag color="danger" variant="solid">Danger</Tag>
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Size and state">
        <PreviewRow>
          <Tag size="small">Small</Tag>
          <Tag>Normal</Tag>
          <Tag size="large">Large</Tag>
          <Tag color="success" onPress={() => undefined}>Pressable</Tag>
          <Tag disabled>Disabled</Tag>
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Preset colors">
        <PreviewRow>
          {PRESET_COLORS.map(color => (
            <Tag key={color} color={color} variant="outlined">
              {color}
            </Tag>
          ))}
        </PreviewRow>
      </PreviewSection>
    </PreviewScaffold>
  );
}
