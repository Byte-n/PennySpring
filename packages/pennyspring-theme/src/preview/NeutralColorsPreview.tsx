import React from 'react';
import { useTheme } from '../useTheme';
import type { AliasToken } from '../types';
import { Section, SubSectionTitle } from './components/Section';
import { Swatch } from './components/Swatch';

const NEUTRAL_TEXT = [
  'colorText',
  'colorTextSecondary',
  'colorTextTertiary',
  'colorTextQuaternary',
];
const NEUTRAL_FILL = [
  'colorFill',
  'colorFillSecondary',
  'colorFillTertiary',
  'colorFillQuaternary',
];
const NEUTRAL_SURFACE = [
  'colorBgLayout',
  'colorBgContainer',
  'colorBgElevated',
  'colorBgSpotlight',
];
const NEUTRAL_BORDER = ['colorBorder', 'colorBorderSecondary'];

export function NeutralColorsPreview() {
  const { token } = useTheme();

  return (
    <Section title="Neutral Colors">
      <SubSectionTitle title="Text" />
      {NEUTRAL_TEXT.map(key => (
        <Swatch
          key={key}
          color={(token[key as keyof AliasToken] as string) || '#000'}
          label={key}
        />
      ))}

      <SubSectionTitle title="Fill" />
      {NEUTRAL_FILL.map(key => (
        <Swatch
          key={key}
          color={(token[key as keyof AliasToken] as string) || '#000'}
          label={key}
        />
      ))}

      <SubSectionTitle title="Surface" />
      {NEUTRAL_SURFACE.map(key => (
        <Swatch
          key={key}
          color={(token[key as keyof AliasToken] as string) || '#000'}
          label={key}
        />
      ))}

      <SubSectionTitle title="Border" />
      {NEUTRAL_BORDER.map(key => (
        <Swatch
          key={key}
          color={(token[key as keyof AliasToken] as string) || '#000'}
          label={key}
        />
      ))}
    </Section>
  );
}
