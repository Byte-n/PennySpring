import {
  calendarConfirmAndCustomTextsDemoTitle,
  CalendarConfirmAndCustomTextsDemo,
} from './confirm-and-custom-texts';
import { calendarDateDemoTitle, CalendarDateDemo } from './date';
import {
  calendarLimitsAndDateControlDemoTitle,
  CalendarLimitsAndDateControlDemo,
} from './limits-and-date-control';
import {
  calendarModesAndRangeDemoTitle,
  CalendarModesAndRangeDemo,
} from './modes-and-range';
import {
  calendarReadonlyAndDisabledDemoTitle,
  CalendarReadonlyAndDisabledDemo,
} from './readonly-and-disabled';

export const calendarDemos = [
  {
    id: 'confirm-and-custom-texts',
    title: calendarConfirmAndCustomTextsDemoTitle,
    Component: CalendarConfirmAndCustomTextsDemo,
  },
  { id: 'date', title: calendarDateDemoTitle, Component: CalendarDateDemo },
  {
    id: 'limits-and-date-control',
    title: calendarLimitsAndDateControlDemoTitle,
    Component: CalendarLimitsAndDateControlDemo,
  },
  {
    id: 'modes-and-range',
    title: calendarModesAndRangeDemoTitle,
    Component: CalendarModesAndRangeDemo,
  },
  {
    id: 'readonly-and-disabled',
    title: calendarReadonlyAndDisabledDemoTitle,
    Component: CalendarReadonlyAndDisabledDemo,
  },
];
