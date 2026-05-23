import { tagPresetColorsDemoTitle, TagPresetColorsDemo } from './preset-colors';
import {
  tagSemanticColorsDemoTitle,
  TagSemanticColorsDemo,
} from './semantic-colors';
import {
  tagSizeAndStateDemoTitle,
  TagSizeAndStateDemo,
} from './size-and-state';
import { tagVariantsDemoTitle, TagVariantsDemo } from './variants';

export const tagDemos = [
  {
    id: 'preset-colors',
    title: tagPresetColorsDemoTitle,
    Component: TagPresetColorsDemo,
  },
  {
    id: 'semantic-colors',
    title: tagSemanticColorsDemoTitle,
    Component: TagSemanticColorsDemo,
  },
  {
    id: 'size-and-state',
    title: tagSizeAndStateDemoTitle,
    Component: TagSizeAndStateDemo,
  },
  { id: 'variants', title: tagVariantsDemoTitle, Component: TagVariantsDemo },
];
