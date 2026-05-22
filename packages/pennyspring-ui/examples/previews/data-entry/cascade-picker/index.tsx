import React from 'react';
import { CascadePicker } from '@pennyspring/ui';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { InlineValue, PreviewStack, joinLabels } from '../pickerPreviewShared';
import type {
  CascadePickerTab,
  CascadePickerValue,
} from '@pennyspring/ui';

type ExpenseTabKey = 'daily' | 'fixed';

const EXPENSE_TABS: Array<CascadePickerTab<unknown, ExpenseTabKey>> = [
  {
    tabKey: 'daily',
    labelText: 'Daily',
    options: [
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
    tabKey: 'fixed',
    labelText: 'Fixed',
    options: [
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

const EMPTY_TABS: Array<CascadePickerTab<unknown, ExpenseTabKey>> = [
  {
    tabKey: 'daily',
    labelText: 'Daily',
    options: [],
  },
];

const DISABLED_TABS: Array<CascadePickerTab<unknown, ExpenseTabKey>> = [
  {
    tabKey: 'daily',
    labelText: 'Daily',
    options: [
      {
        labelText: 'Food',
        value: 'food',
        children: [
          { labelText: 'Breakfast', value: 'breakfast', disabled: true },
          { labelText: 'Dinner', value: 'dinner' },
        ],
      },
    ],
  },
  {
    tabKey: 'fixed',
    labelText: 'Fixed',
    disabled: true,
    options: [
      {
        labelText: 'Home',
        value: 'home',
        children: [{ labelText: 'Rent', value: 'rent' }],
      },
    ],
  },
];

export function CascadePickerPreview() {
  const [controlledValue, setControlledValue] = React.useState<CascadePickerValue<ExpenseTabKey>>({
    daily: ['traffic', 'metro'],
    fixed: ['home', 'rent'],
  });
  const [controlledSummary, setControlledSummary] = React.useState('Daily / Traffic / Metro');

  return (
    <PreviewScaffold>
      <PreviewSection title="Basic">
        <PreviewStack>
          <CascadePicker
            tabs={EXPENSE_TABS}
            defaultValue={{
              daily: ['food', 'breakfast'],
              fixed: ['home', 'rent'],
            }}
            placeholder="Select category"
            titleText="Category"
          />
          <CascadePicker
            tabs={EXPENSE_TABS}
            defaultValue={{
              daily: ['traffic', 'metro'],
              fixed: ['home', 'utilities'],
            }}
            placeholder="Select expense"
            titleText="Fixed expense"
          />
        </PreviewStack>
      </PreviewSection>

      <PreviewSection title="Controlled">
        <PreviewStack>
          <CascadePicker
            tabs={EXPENSE_TABS}
            value={controlledValue}
            placeholder="Select category path"
            titleText="Controlled category"
            onChange={nextValue => setControlledValue(nextValue)}
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
            tabs={EXPENSE_TABS}
            placeholder="Not selectable"
            titleText="Disabled"
          />
          <CascadePicker
            tabs={DISABLED_TABS}
            defaultValue={{ daily: ['food', 'dinner'], fixed: ['home', 'rent'] }}
            placeholder="Disabled tab and option"
            titleText="Disabled options"
          />
          <CascadePicker
            emptyText="No category"
            tabs={EMPTY_TABS}
            placeholder="No category"
            titleText="Empty"
          />
          <CascadePicker
            tabs={EXPENSE_TABS}
            loading
            loadingIndicatorText="Loading categories"
            placeholder="Loading state"
            titleText="Loading"
          />
          <CascadePicker
            tabs={EXPENSE_TABS}
            placeholder="Custom texts and renderLabel"
            titleText="Custom header"
            cancelText="Dismiss"
            okText="Confirm"
            okDisabled
            renderLabel={item => item.labelText ? `${item.labelText} - ${String(item.value)}` : String(item.value)}
          />
        </PreviewStack>
      </PreviewSection>
    </PreviewScaffold>
  );
}
