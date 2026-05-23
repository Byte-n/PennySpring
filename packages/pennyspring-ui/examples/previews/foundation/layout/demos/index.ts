import { layoutColumnDemoTitle, LayoutColumnDemo } from './column';
import {
  layoutGeometryReaderDemoTitle,
  LayoutGeometryReaderDemo,
} from './geometry-reader';
import { layoutRowDemoTitle, LayoutRowDemo } from './row';
import { layoutSpacerDemoTitle, LayoutSpacerDemo } from './spacer';

export const layoutDemos = [
  { id: 'column', title: layoutColumnDemoTitle, Component: LayoutColumnDemo },
  {
    id: 'geometry-reader',
    title: layoutGeometryReaderDemoTitle,
    Component: LayoutGeometryReaderDemo,
  },
  { id: 'row', title: layoutRowDemoTitle, Component: LayoutRowDemo },
  { id: 'spacer', title: layoutSpacerDemoTitle, Component: LayoutSpacerDemo },
];
