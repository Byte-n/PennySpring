import React from 'react';
import { TimePicker } from '@pennyspring/component';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { InlineValue, PreviewStack, formatTime } from '../pickerPreviewShared';

const BASE_TIME = new Date(2026, 4, 9, 14, 30, 20);
const MIN_TIME = new Date(2026, 4, 9, 9, 0, 0);
const MAX_TIME = new Date(2026, 4, 9, 18, 0, 0);

export function TimePickerPreview() {
  const [controlledTime, setControlledTime] = React.useState(BASE_TIME);

  return (
    <PreviewScaffold>
      <PreviewSection title="Precision">
        <PreviewStack>
          <TimePicker
            precision="hour"
            defaultValue={BASE_TIME}
            placeholder="Select hour"
            titleText="Hour"
          />
          <TimePicker
            precision="minute"
            defaultValue={BASE_TIME}
            placeholder="Select minute"
            titleText="Minute"
          />
          <TimePicker
            precision="second"
            secondStep={10}
            defaultValue={BASE_TIME}
            placeholder="Select second"
            titleText="Second"
          />
        </PreviewStack>
      </PreviewSection>

      <PreviewSection title="Controlled">
        <PreviewStack>
          <TimePicker
            precision="minute"
            minuteStep={15}
            min={MIN_TIME}
            max={MAX_TIME}
            value={controlledTime}
            onChange={setControlledTime}
            placeholder="Select time"
            titleText="Controlled time"
          />
          <InlineValue label="Current" value={formatTime(controlledTime)} />
        </PreviewStack>
      </PreviewSection>

      <PreviewSection title="Range and state">
        <PreviewStack>
          <TimePicker
            precision="minute"
            minuteStep={15}
            min={MIN_TIME}
            max={MAX_TIME}
            defaultValue={BASE_TIME}
            placeholder="Business hours"
            titleText="Business hours"
          />
          <TimePicker
            disabled
            defaultValue={BASE_TIME}
            placeholder="Not selectable"
            titleText="Disabled"
          />
        </PreviewStack>
      </PreviewSection>
    </PreviewScaffold>
  );
}
