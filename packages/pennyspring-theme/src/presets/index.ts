import type { SeedToken } from '../types';
import { april } from './april';
import { cocoa } from './cocoa';
import { kaori } from './kaori';
import { mauve } from './mauve';
import { mono } from './mono';
import { penny } from './penny';
import { slate } from './slate';
import { spring } from './spring';
import { yonder } from './yonder';

export type ThemePresetName =
  | 'default'
  | 'april'
  | 'kaori'
  | 'penny'
  | 'spring'
  | 'yonder'
  | 'mauve'
  | 'cocoa'
  | 'slate'
  | 'mono';

export interface ThemePreset {
  label: string;
  value: ThemePresetName;
  data: Partial<SeedToken>;
}

export const themePresets: ThemePreset[] = [
  { label: '默认', value: 'default', data: {} },
  { label: '春绿', value: 'april', data: april },
  { label: '樱粉', value: 'kaori', data: kaori },
  { label: '暖金', value: 'penny', data: penny },
  { label: '青碧', value: 'spring', data: spring },
  { label: '远山', value: 'yonder', data: yonder },
  { label: '藕荷', value: 'mauve', data: mauve },
  { label: '可可', value: 'cocoa', data: cocoa },
  { label: '石墨', value: 'slate', data: slate },
  { label: '墨白', value: 'mono', data: mono },
];
