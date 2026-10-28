import {
  skeletonCompositionDemoTitle,
  SkeletonCompositionDemo,
} from './composition';
import { skeletonDarkDemoTitle, SkeletonDarkDemo } from './dark';
import { skeletonShapeDemoTitle, SkeletonShapeDemo } from './shape';
import { skeletonStatesDemoTitle, SkeletonStatesDemo } from './states';

export const skeletonDemos = [
  { id: 'shape', title: skeletonShapeDemoTitle, Component: SkeletonShapeDemo },
  {
    id: 'composition',
    title: skeletonCompositionDemoTitle,
    Component: SkeletonCompositionDemo,
  },
  {
    id: 'states',
    title: skeletonStatesDemoTitle,
    Component: SkeletonStatesDemo,
  },
  { id: 'dark', title: skeletonDarkDemoTitle, Component: SkeletonDarkDemo },
];
