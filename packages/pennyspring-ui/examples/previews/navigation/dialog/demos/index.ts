import { dialogControlledDemoTitle, DialogControlledDemo } from './controlled';
import {
  dialogEventFeedbackDemoTitle,
  DialogEventFeedbackDemo,
} from './event-feedback';
import {
  dialogStateAndSlotsDemoTitle,
  DialogStateAndSlotsDemo,
} from './state-and-slots';

export const dialogDemos = [
  {
    id: 'controlled',
    title: dialogControlledDemoTitle,
    Component: DialogControlledDemo,
  },
  {
    id: 'event-feedback',
    title: dialogEventFeedbackDemoTitle,
    Component: DialogEventFeedbackDemo,
  },
  {
    id: 'state-and-slots',
    title: dialogStateAndSlotsDemoTitle,
    Component: DialogStateAndSlotsDemo,
  },
];
