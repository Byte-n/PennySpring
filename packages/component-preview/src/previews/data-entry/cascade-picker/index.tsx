import React from 'react';
import { CascadePicker } from '@pennyspring/component';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { InlineValue, PreviewStack, joinLabels } from '../pickerPreviewShared';
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
            placeholder="Select category"
            titleText="Category"
          />
          <CascadePicker
            options={CASCADE_OPTIONS}
            defaultValue={['fixed', 'home', 'rent']}
            placeholder="Select expense"
            titleText="Fixed expense"
          />
        </PreviewStack>
      </PreviewSection>

      <PreviewSection title="Controlled">
        <PreviewStack>
          <CascadePicker
            options={CASCADE_OPTIONS}
            value={controlledValue}
            placeholder="Select category path"
            titleText="Controlled category"
            onChange={nextValue => setControlledValue(nextValue.map(String))}
            onOk={(_nextValue, params) => {
              setControlledSummary(joinLabels(params.path.map(item => item.labelText)));
            }}
          />
          <InlineValue label="Selected" value={controlledSummary} />
        </PreviewStack>
      </PreviewSection>

      <PreviewSection title="State">
        <PreviewStack>
          <CascadePicker
            disabled
            options={CASCADE_OPTIONS}
            placeholder="Not selectable"
            titleText="Disabled"
          />
          <CascadePicker
            options={CASCADE_OPTIONS}
            defaultValue={['daily', 'traffic', 'metro']}
            placeholder="Default open"
            titleText="Default open"
          />
          <CascadePicker
            emptyText="No category"
            options={EMPTY_OPTIONS}
            placeholder="No category"
            titleText="Empty"
          />
        </PreviewStack>
      </PreviewSection>
    </PreviewScaffold>
  );
}
