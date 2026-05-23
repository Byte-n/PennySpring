import {
  messageControllerTypePlacementDurationAndSizeDemoTitle,
  MessageControllerTypePlacementDurationAndSizeDemo,
} from './controller-type-placement-duration-and-size';
import {
  messageDeclarativeMountPointAndAfterOpenChangeDemoTitle,
  MessageDeclarativeMountPointAndAfterOpenChangeDemo,
} from './declarative-mount-point-and-after-open-change';

export const messageDemos = [
  {
    id: 'controller-type-placement-duration-and-size',
    title: messageControllerTypePlacementDurationAndSizeDemoTitle,
    Component: MessageControllerTypePlacementDurationAndSizeDemo,
  },
  {
    id: 'declarative-mount-point-and-after-open-change',
    title: messageDeclarativeMountPointAndAfterOpenChangeDemoTitle,
    Component: MessageDeclarativeMountPointAndAfterOpenChangeDemo,
  },
];
