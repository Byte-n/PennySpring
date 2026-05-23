import {
  floatingActionGroupEventFeedbackDemoTitle,
  FloatingActionGroupEventFeedbackDemo,
} from './event-feedback';
import {
  floatingActionGroupPlacementAndMountPointDemoTitle,
  FloatingActionGroupPlacementAndMountPointDemo,
} from './placement-and-mount-point';
import {
  floatingActionGroupPreviewCanvasDemoTitle,
  FloatingActionGroupPreviewCanvasDemo,
} from './preview-canvas';

export const floatingActionGroupDemos = [
  {
    id: 'event-feedback',
    title: floatingActionGroupEventFeedbackDemoTitle,
    Component: FloatingActionGroupEventFeedbackDemo,
  },
  {
    id: 'placement-and-mount-point',
    title: floatingActionGroupPlacementAndMountPointDemoTitle,
    Component: FloatingActionGroupPlacementAndMountPointDemo,
  },
  {
    id: 'preview-canvas',
    title: floatingActionGroupPreviewCanvasDemoTitle,
    Component: FloatingActionGroupPreviewCanvasDemo,
  },
];
