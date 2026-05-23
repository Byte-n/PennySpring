import React from 'react';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { dateTimePickerDemos } from './demos';

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
