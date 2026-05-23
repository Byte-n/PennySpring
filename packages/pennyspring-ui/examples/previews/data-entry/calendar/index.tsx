import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { calendarDemos } from './demos';

export function CalendarPreview() {
  return (
    <PreviewScaffold>
      {calendarDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default CalendarPreview;
