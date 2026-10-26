import {
  calendarPickerConfirmAndCustomTextsDemoTitle,
  CalendarPickerConfirmAndCustomTextsDemo,
} from './confirm-and-custom-texts';
import { calendarPickerDateDemoTitle, CalendarPickerDateDemo } from './date';
import {
  calendarPickerLimitsAndDateControlDemoTitle,
  CalendarPickerLimitsAndDateControlDemo,
} from './limits-and-date-control';
import {
  calendarPickerModesAndRangeDemoTitle,
  CalendarPickerModesAndRangeDemo,
} from './modes-and-range';
import {
  calendarPickerReadonlyAndDisabledDemoTitle,
  CalendarPickerReadonlyAndDisabledDemo,
} from './readonly-and-disabled';

export const calendarPickerDemos = [
  {
    id: 'confirm-and-custom-texts',
    title: calendarPickerConfirmAndCustomTextsDemoTitle,
    Component: CalendarPickerConfirmAndCustomTextsDemo,
  },
  {
    id: 'date',
    title: calendarPickerDateDemoTitle,
    Component: CalendarPickerDateDemo,
  },
  {
    id: 'limits-and-date-control',
    title: calendarPickerLimitsAndDateControlDemoTitle,
    Component: CalendarPickerLimitsAndDateControlDemo,
  },
  {
    id: 'modes-and-range',
    title: calendarPickerModesAndRangeDemoTitle,
    Component: CalendarPickerModesAndRangeDemo,
  },
  {
    id: 'readonly-and-disabled',
    title: calendarPickerReadonlyAndDisabledDemoTitle,
    Component: CalendarPickerReadonlyAndDisabledDemo,
  },
];
