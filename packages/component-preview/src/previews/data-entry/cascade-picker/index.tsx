import React from 'react';
import { CascadePicker } from '@pennyspring/component';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import {
  InlineValue,
  PreviewStack,
  TriggerContent,
  joinLabels,
} from '../pickerPreviewShared';
import type { CascadePickerOption } from '@pennyspring/component';

const CASCADE_OPTIONS: CascadePickerOption[] = [
  {
    labelText: 'Daily',
    value: 'daily',
    children: [
      {
        labelText: 'Food',
        value: 'food',
        children: [
          { labelText: 'Breakfast', value: 'breakfast' },
          { labelText: 'Dinner', value: 'dinner' },
        ],
      },
      {
        labelText: 'Traffic',
        value: 'traffic',
        children: [
          { labelText: 'Metro', value: 'metro' },
          { labelText: 'Taxi', value: 'taxi' },
        ],
      },
    ],
  },
  {
    labelText: 'Fixed',
    value: 'fixed',
    children: [
      {
        labelText: 'Home',
        value: 'home',
        children: [
          { labelText: 'Rent', value: 'rent' },
          { labelText: 'Utilities', value: 'utilities' },
        ],
      },
    ],
  },
];

const EMPTY_OPTIONS: CascadePickerOption[] = [];

export function CascadePickerPreview() {
  const [controlledValue, setControlledValue] = React.useState(['daily', 'traffic', 'metro']);
  const [controlledSummary, setControlledSummary] = React.useState('Daily / Traffic / Metro');

  return (
    <PreviewScaffold>
      <PreviewSection title="Basic">
        <PreviewStack>
          <CascadePicker
            options={CASCADE_OPTIONS}
            defaultValue={['daily', 'food', 'breakfast']}
            titleText="Category"
          >
            <TriggerContent label="Three levels" value="Daily / Food / Breakfast" />
          </CascadePicker>
          <CascadePicker
            options={CASCADE_OPTIONS}
            defaultValue={['fixed', 'home', 'rent']}
            titleText="Fixed expense"
          >
            <TriggerContent label="Default value" value="Fixed / Home / Rent" />
          </CascadePicker>
        </PreviewStack>
      </PreviewSection>

      <PreviewSection title="Controlled">
        <PreviewStack>
          <CascadePicker
            options={CASCADE_OPTIONS}
            value={controlledValue}
            titleText="Controlled category"
            onChange={nextValue => setControlledValue(nextValue.map(String))}
            onOk={(_nextValue, params) => {
              setControlledSummary(joinLabels(params.path.map(item => item.labelText)));
            }}
          >
            <TriggerContent label="Controlled path" value={controlledSummary} />
          </CascadePicker>
          <InlineValue label="Selected" value={controlledSummary} />
        </PreviewStack>
      </PreviewSection>

      <PreviewSection title="State">
        <PreviewStack>
          <CascadePicker disabled options={CASCADE_OPTIONS} titleText="Disabled">
            <TriggerContent label="Disabled" value="Not selectable" />
          </CascadePicker>
          <CascadePicker
            options={CASCADE_OPTIONS}
            defaultValue={['daily', 'traffic', 'metro']}
            titleText="Default open"
          >
            <TriggerContent label="Default open" value="Daily / Traffic / Metro" />
          </CascadePicker>
          <CascadePicker
            emptyText="No category"
            options={EMPTY_OPTIONS}
            titleText="Empty"
          >
            <TriggerContent label="Empty" value="No category" />
          </CascadePicker>
        </PreviewStack>
      </PreviewSection>
    </PreviewScaffold>
  );
}
