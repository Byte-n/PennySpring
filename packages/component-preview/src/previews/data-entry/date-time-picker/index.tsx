import React from 'react';
import { DateTimePicker } from '@pennyspring/component';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import {
  InlineValue,
  PreviewStack,
  TriggerContent,
  formatDate,
  formatDateTime,
} from '../pickerPreviewShared';

const BASE_DATE = new Date(2026, 4, 9, 14, 30, 20);
const MIN_DATE = new Date(2026, 0, 1, 0, 0, 0);
const MAX_DATE = new Date(2026, 11, 31, 23, 59, 59);

export function DateTimePickerPreview() {
  const [controlledDate, setControlledDate] = React.useState(BASE_DATE);

  return (
    <PreviewScaffold>
      <PreviewSection title="Precision">
        <PreviewStack>
          <DateTimePicker precision="day" defaultValue={BASE_DATE} titleText="Date">
            <TriggerContent label="Date" value="2026-05-09" />
          </DateTimePicker>
          <DateTimePicker precision="minute" defaultValue={BASE_DATE} titleText="Date and time">
            <TriggerContent label="Date time" value="2026-05-09 14:30" />
          </DateTimePicker>
          <DateTimePicker
            precision="second"
            secondStep={10}
            defaultValue={BASE_DATE}
            titleText="Second precision"
          >
            <TriggerContent label="Second step" value="2026-05-09 14:30:20" />
          </DateTimePicker>
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
            titleText="Controlled date time"
          >
            <TriggerContent
              label="Controlled"
              value={formatDateTime(controlledDate)}
              meta="15 minute step"
            />
          </DateTimePicker>
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
            titleText="Month in 2026"
          >
            <TriggerContent label="Default open" value="2026-05" />
          </DateTimePicker>
          <DateTimePicker disabled defaultValue={BASE_DATE} titleText="Disabled">
            <TriggerContent label="Disabled" value={formatDate(BASE_DATE)} />
          </DateTimePicker>
        </PreviewStack>
      </PreviewSection>
    </PreviewScaffold>
  );
}
