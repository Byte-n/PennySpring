import {
  notificationControllerPlacementTypeDurationAndSizeDemoTitle,
  NotificationControllerPlacementTypeDurationAndSizeDemo,
} from './controller-placement-type-duration-and-size';
import {
  notificationDeclarativeMountPointAndAfterOpenChangeDemoTitle,
  NotificationDeclarativeMountPointAndAfterOpenChangeDemo,
} from './declarative-mount-point-and-after-open-change';

export const notificationDemos = [
  {
    id: 'controller-placement-type-duration-and-size',
    title: notificationControllerPlacementTypeDurationAndSizeDemoTitle,
    Component: NotificationControllerPlacementTypeDurationAndSizeDemo,
  },
  {
    id: 'declarative-mount-point-and-after-open-change',
    title: notificationDeclarativeMountPointAndAfterOpenChangeDemoTitle,
    Component: NotificationDeclarativeMountPointAndAfterOpenChangeDemo,
  },
];
