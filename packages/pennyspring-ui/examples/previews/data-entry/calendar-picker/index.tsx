import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { calendarPickerDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'CalendarPicker',
  description: '日历面板、输入型选择与范围选择。',
  order: 13,
  docId: 'components/data-entry/calendar',
  demos: [
    { id: 'confirm-and-custom-texts', title: 'Confirm and custom texts' },
    { id: 'date', title: 'Date' },
    { id: 'limits-and-date-control', title: 'Limits and date control' },
    { id: 'modes-and-range', title: 'Modes and range' },
    { id: 'readonly-and-disabled', title: 'Readonly and disabled' },
  ],
} satisfies PreviewMeta;

export function CalendarPickerPreview() {
  return (
    <PreviewScaffold>
      {calendarPickerDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default CalendarPickerPreview;
