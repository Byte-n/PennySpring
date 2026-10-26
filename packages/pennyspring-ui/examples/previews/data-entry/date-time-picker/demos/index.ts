import {
  dateTimePickerCalendarLayoutDemoTitle,
  DateTimePickerCalendarLayoutDemo,
} from './calendar-layout';
import {
  dateTimePickerControlledDemoTitle,
  DateTimePickerControlledDemo,
} from './controlled';
import {
  dateTimePickerDateDemoTitle,
  DateTimePickerDateDemo,
} from './date';
import {
  dateTimePickerPrecisionDemoTitle,
  DateTimePickerPrecisionDemo,
} from './precision';
import {
  dateTimePickerRangeAndStateDemoTitle,
  DateTimePickerRangeAndStateDemo,
} from './range-and-state';
import {
  dateTimePickerTimeControlledDemoTitle,
  DateTimePickerTimeControlledDemo,
} from './time-controlled';
import {
  dateTimePickerTimePrecisionDemoTitle,
  DateTimePickerTimePrecisionDemo,
} from './time-precision';
import {
  dateTimePickerTimeRangeAndStateDemoTitle,
  DateTimePickerTimeRangeAndStateDemo,
} from './time-range-and-state';

export const dateTimePickerDemos = [
  {
    id: 'controlled',
    title: dateTimePickerControlledDemoTitle,
    Component: DateTimePickerControlledDemo,
  },
  {
    id: 'calendar-layout',
    title: dateTimePickerCalendarLayoutDemoTitle,
    Component: DateTimePickerCalendarLayoutDemo,
  },
  {
    id: 'date',
    title: dateTimePickerDateDemoTitle,
    Component: DateTimePickerDateDemo,
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
  {
    id: 'time-controlled',
    title: dateTimePickerTimeControlledDemoTitle,
    Component: DateTimePickerTimeControlledDemo,
  },
  {
    id: 'time-precision',
    title: dateTimePickerTimePrecisionDemoTitle,
    Component: DateTimePickerTimePrecisionDemo,
  },
  {
    id: 'time-range-and-state',
    title: dateTimePickerTimeRangeAndStateDemoTitle,
    Component: DateTimePickerTimeRangeAndStateDemo,
  },
];
