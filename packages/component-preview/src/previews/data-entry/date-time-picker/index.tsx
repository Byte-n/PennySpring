import React from 'react';
import { DateTimePicker } from '@pennyspring/component';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { InlineValue, PreviewStack, formatDateTime } from '../pickerPreviewShared';

const BASE_DATE = new Date(2026, 4, 9, 14, 30, 20);
const MIN_DATE = new Date(2026, 0, 1, 0, 0, 0);
const MAX_DATE = new Date(2026, 11, 31, 23, 59, 59);

export function DateTimePickerPreview() {
  const [controlledDate, setControlledDate] = React.useState(BASE_DATE);

  return (
    <PreviewScaffold>
      <PreviewSection title="Precision">
        <PreviewStack>
          <DateTimePicker
            precision="day"
            defaultValue={BASE_DATE}
            placeholder="Select date"
            titleText="Date"
          />
          <DateTimePicker
            precision="minute"
            defaultValue={BASE_DATE}
            placeholder="Select date and time"
            titleText="Date and time"
          />
          <DateTimePicker
            precision="second"
            secondStep={10}
            defaultValue={BASE_DATE}
            placeholder="Select second precision"
            titleText="Second precision"
          />
        </PreviewStack>
      </PreviewSection>

      <PreviewSection title="Controlled">
        <PreviewStack>
          <DateTimePicker
            precision="minute"
            value={controlledDate}
            min={MIN_DATE}
            max={MAX_DATE}
            minuteStep={15}
            onChange={setControlledDate}
            placeholder="Select date and time"
            titleText="Controlled date time"
          />
          <InlineValue label="Current" value={formatDateTime(controlledDate)} />
        </PreviewStack>
      </PreviewSection>

      <PreviewSection title="Range and state">
        <PreviewStack>
          <DateTimePicker
            precision="month"
            min={MIN_DATE}
            max={MAX_DATE}
            defaultValue={BASE_DATE}
            placeholder="Select month"
            titleText="Month in 2026"
          />
          <DateTimePicker
            disabled
            defaultValue={BASE_DATE}
            placeholder="Not selectable"
            titleText="Disabled"
          />
        </PreviewStack>
      </PreviewSection>
    </PreviewScaffold>
  );
}
