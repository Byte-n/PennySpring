import {
  popupAnimationDemoTitle,
  PopupAnimationDemo,
} from './animation';
import {
  popupEventFeedbackDemoTitle,
  PopupEventFeedbackDemo,
} from './event-feedback';
import {
  popupFloatingPanelDemoTitle,
  PopupFloatingPanelDemo,
} from './floating-panel';
import {
  popupMaskAndCloseBehaviorDemoTitle,
  PopupMaskAndCloseBehaviorDemo,
} from './mask-and-close-behavior';
import { popupPositionDemoTitle, PopupPositionDemo } from './position';

export const popupDemos = [
  {
    id: 'animation',
    title: popupAnimationDemoTitle,
    Component: PopupAnimationDemo,
  },
  {
    id: 'event-feedback',
    title: popupEventFeedbackDemoTitle,
    Component: PopupEventFeedbackDemo,
  },
  {
    id: 'floating-panel',
    title: popupFloatingPanelDemoTitle,
    Component: PopupFloatingPanelDemo,
  },
  {
    id: 'mask-and-close-behavior',
    title: popupMaskAndCloseBehaviorDemoTitle,
    Component: PopupMaskAndCloseBehaviorDemo,
  },
  {
    id: 'position',
    title: popupPositionDemoTitle,
    Component: PopupPositionDemo,
  },
];
