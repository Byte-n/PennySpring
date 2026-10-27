import { notificationPlacementDemoTitle, NotificationPlacementDemo } from './placement';
import { notificationSizeDemoTitle, NotificationSizeDemo } from './size';
import { notificationStructureDemoTitle, NotificationStructureDemo } from './structure';
import { notificationTypesDemoTitle, NotificationTypesDemo } from './types';

export const notificationDemos = [
  { id: 'types', title: notificationTypesDemoTitle, Component: NotificationTypesDemo },
  { id: 'size', title: notificationSizeDemoTitle, Component: NotificationSizeDemo },
  {
    id: 'structure',
    title: notificationStructureDemoTitle,
    Component: NotificationStructureDemo,
  },
  {
    id: 'placement',
    title: notificationPlacementDemoTitle,
    Component: NotificationPlacementDemo,
  },
];
