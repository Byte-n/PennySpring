import React from 'react';
import { TimePicker } from '@pennyspring/ui';
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
          <TimePicker
            precision="minute"
            minuteStep={20}
            defaultValue={BASE_TIME}
            formatLabel={(value, params) => (params.type === 'minute' ? `${String(value).padStart(2, '0')}m` : String(value))}
            placeholder="Custom format label"
            titleText="Format label"
          />
          <TimePicker
            precision="hour"
            defaultValue={BASE_TIME}
            renderLabel={({ type, value }) => `${type}: ${value}`}
            placeholder="Custom render label"
            titleText="Render label"
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
          <TimePicker
            loading
            loadingIndicatorText="Loading time ranges"
            emptyText="No available time"
            placeholder="Loading state"
            titleText="Loading and empty"
          />
          <TimePicker
            okDisabled
            defaultValue={BASE_TIME}
            placeholder="Cannot confirm"
            titleText="Ok disabled"
          />
        </PreviewStack>
      </PreviewSection>
    </PreviewScaffold>
  );
}
