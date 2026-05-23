import {
  spaceAlignAndJustifyDemoTitle,
  SpaceAlignAndJustifyDemo,
} from './align-and-justify';
import { spaceDirectionDemoTitle, SpaceDirectionDemo } from './direction';
import { spaceSizeDemoTitle, SpaceSizeDemo } from './size';
import { spaceWrapDemoTitle, SpaceWrapDemo } from './wrap';

export const spaceDemos = [
  {
    id: 'align-and-justify',
    title: spaceAlignAndJustifyDemoTitle,
    Component: SpaceAlignAndJustifyDemo,
  },
  {
    id: 'direction',
    title: spaceDirectionDemoTitle,
    Component: SpaceDirectionDemo,
  },
  { id: 'size', title: spaceSizeDemoTitle, Component: SpaceSizeDemo },
  { id: 'wrap', title: spaceWrapDemoTitle, Component: SpaceWrapDemo },
];
