import {
  actionSheetEventFeedbackDemoTitle,
  ActionSheetEventFeedbackDemo,
} from './event-feedback';
import {
  actionSheetOpenAndActionsDemoTitle,
  ActionSheetOpenAndActionsDemo,
} from './open-and-actions';

export const actionSheetDemos = [
  {
    id: 'event-feedback',
    title: actionSheetEventFeedbackDemoTitle,
    Component: ActionSheetEventFeedbackDemo,
  },
  {
    id: 'open-and-actions',
    title: actionSheetOpenAndActionsDemoTitle,
    Component: ActionSheetOpenAndActionsDemo,
  },
];
