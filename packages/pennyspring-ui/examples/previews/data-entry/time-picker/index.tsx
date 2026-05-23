import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { timePickerDemos } from './demos';

export function TimePickerPreview() {
  return (
    <PreviewScaffold>
      {timePickerDemos.map(({ title, Component }) => (
        <PreviewSection key={title} title={title}>
          <Component />
        </PreviewSection>
      ))}
    </PreviewScaffold>
  );
}

export default TimePickerPreview;
