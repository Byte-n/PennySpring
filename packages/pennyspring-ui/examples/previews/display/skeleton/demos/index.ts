import {
  skeletonAnimatedAndStaticDemoTitle,
  SkeletonAnimatedAndStaticDemo,
} from './animated-and-static';
import { skeletonLayoutDemoTitle, SkeletonLayoutDemo } from './layout';
import {
  skeletonLoadingSwitchDemoTitle,
  SkeletonLoadingSwitchDemo,
} from './loading-switch';
import { skeletonShapeDemoTitle, SkeletonShapeDemo } from './shape';

export const skeletonDemos = [
  {
    id: 'animated-and-static',
    title: skeletonAnimatedAndStaticDemoTitle,
    Component: SkeletonAnimatedAndStaticDemo,
  },
  {
    id: 'layout',
    title: skeletonLayoutDemoTitle,
    Component: SkeletonLayoutDemo,
  },
  {
    id: 'loading-switch',
    title: skeletonLoadingSwitchDemoTitle,
    Component: SkeletonLoadingSwitchDemo,
  },
  { id: 'shape', title: skeletonShapeDemoTitle, Component: SkeletonShapeDemo },
];
