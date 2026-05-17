import React from 'react';
import { TimePicker } from '@pennyspring/component';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import {
  InlineValue,
  PreviewStack,
  TriggerContent,
  formatTime,
} from '../pickerPreviewShared';

const BASE_TIME = new Date(2026, 4, 9, 14, 30, 20);
const MIN_TIME = new Date(2026, 4, 9, 9, 0, 0);
const MAX_TIME = new Date(2026, 4, 9, 18, 0, 0);

export function TimePickerPreview() {
  const [controlledTime, setControlledTime] = React.useState(BASE_TIME);

  return (
    <PreviewScaffold>
      <PreviewSection title="Precision">
        <PreviewStack>
          <TimePicker precision="hour" defaultValue={BASE_TIME} titleText="Hour">
            <TriggerContent label="Hour" value="14:00" />
          </TimePicker>
          <TimePicker precision="minute" defaultValue={BASE_TIME} titleText="Minute">
            <TriggerContent label="Minute" value="14:30" />
          </TimePicker>
          <TimePicker
            precision="second"
            secondStep={10}
            defaultValue={BASE_TIME}
            titleText="Second"
          >
            <TriggerContent label="Second step" value="14:30:20" />
          </TimePicker>
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
            titleText="Controlled time"
          >
            <TriggerContent
              label="Controlled"
              value={formatTime(controlledTime)}
              meta="Business hours"
            />
          </TimePicker>
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
            titleText="Business hours"
          >
            <TriggerContent label="Default open" value="14:30" />
          </TimePicker>
          <TimePicker disabled defaultValue={BASE_TIME} titleText="Disabled">
            <TriggerContent label="Disabled" value={formatTime(BASE_TIME)} />
          </TimePicker>
        </PreviewStack>
      </PreviewSection>
    </PreviewScaffold>
  );
}
