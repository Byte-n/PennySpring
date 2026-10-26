import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { calendarPickerDemos } from './demos';

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
