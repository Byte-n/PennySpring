import {
  timePickerControlledDemoTitle,
  TimePickerControlledDemo,
} from './controlled';
import {
  timePickerPrecisionDemoTitle,
  TimePickerPrecisionDemo,
} from './precision';
import {
  timePickerRangeAndStateDemoTitle,
  TimePickerRangeAndStateDemo,
} from './range-and-state';

export const timePickerDemos = [
  {
    id: 'controlled',
    title: timePickerControlledDemoTitle,
    Component: TimePickerControlledDemo,
  },
  {
    id: 'precision',
    title: timePickerPrecisionDemoTitle,
    Component: TimePickerPrecisionDemo,
  },
  {
    id: 'range-and-state',
    title: timePickerRangeAndStateDemoTitle,
    Component: TimePickerRangeAndStateDemo,
  },
];
