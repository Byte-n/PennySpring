import {
  dateTimePickerControlledDemoTitle,
  DateTimePickerControlledDemo,
} from './controlled';
import {
  dateTimePickerPrecisionDemoTitle,
  DateTimePickerPrecisionDemo,
} from './precision';
import {
  dateTimePickerRangeAndStateDemoTitle,
  DateTimePickerRangeAndStateDemo,
} from './range-and-state';

export const dateTimePickerDemos = [
  {
    id: 'controlled',
    title: dateTimePickerControlledDemoTitle,
    Component: DateTimePickerControlledDemo,
  },
  {
    id: 'precision',
    title: dateTimePickerPrecisionDemoTitle,
    Component: DateTimePickerPrecisionDemo,
  },
  {
    id: 'range-and-state',
    title: dateTimePickerRangeAndStateDemoTitle,
    Component: DateTimePickerRangeAndStateDemo,
  },
];
