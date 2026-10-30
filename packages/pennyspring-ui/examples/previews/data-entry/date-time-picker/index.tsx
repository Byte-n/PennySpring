import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { dateTimePickerDemos } from './demos';
import type { PreviewMeta } from '../../types';

export const previewMeta = {
  title: 'DateTimePicker',
  description: '日期时间、仅日期与仅时间预设、滚轮与日历布局。',
  order: 17,
  demos: [
    { id: 'controlled', title: 'Controlled' },
    { id: 'calendar-layout', title: 'Calendar layout' },
    { id: 'date', title: 'Date preset' },
    { id: 'precision', title: 'Precision' },
    { id: 'range-and-state', title: 'Range and state' },
    { id: 'time-controlled', title: 'Time controlled' },
    { id: 'time-precision', title: 'Time precision' },
    { id: 'time-range-and-state', title: 'Time range and state' },
  ],
} satisfies PreviewMeta;

export function DateTimePickerPreview() {
  return (
    <PreviewScaffold>
      {dateTimePickerDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default DateTimePickerPreview;
