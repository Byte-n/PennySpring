import {
  toastControllerPlacementDurationAndSizeDemoTitle,
  ToastControllerPlacementDurationAndSizeDemo,
} from './controller-placement-duration-and-size';
import {
  toastDeclarativeMountPointAndAfterOpenChangeDemoTitle,
  ToastDeclarativeMountPointAndAfterOpenChangeDemo,
} from './declarative-mount-point-and-after-open-change';

export const toastDemos = [
  {
    id: 'controller-placement-duration-and-size',
    title: toastControllerPlacementDurationAndSizeDemoTitle,
    Component: ToastControllerPlacementDurationAndSizeDemo,
  },
  {
    id: 'declarative-mount-point-and-after-open-change',
    title: toastDeclarativeMountPointAndAfterOpenChangeDemoTitle,
    Component: ToastDeclarativeMountPointAndAfterOpenChangeDemo,
  },
];
