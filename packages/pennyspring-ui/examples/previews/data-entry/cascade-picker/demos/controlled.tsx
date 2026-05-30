import React from 'react';
import { Space, CascadePicker, Text } from '@pennyspring/ui';
import type { CascadePickerTab, CascadePickerValue } from '@pennyspring/ui';

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

function joinLabels(labels: Array<string | undefined>): string {
  const visibleLabels = labels.filter((label): label is string =>
    label !== undefined && label.length > 0,
  );

  if (visibleLabels.length === 0) {
    return 'None';
  }

  return visibleLabels.join(' / ');
}

export const cascadePickerControlledDemoTitle = 'Controlled';

export function CascadePickerControlledDemo() {
  const [controlledValue, setControlledValue] = React.useState<
    CascadePickerValue<ExpenseTabKey>
  >({
    daily: ['traffic', 'metro'],
    fixed: ['home', 'rent'],
  });
  const [controlledSummary, setControlledSummary] = React.useState(
    'Daily / Traffic / Metro',
  );

  return (
    <>
      <Space block direction="vertical" size="large">
        <CascadePicker
          tabs={EXPENSE_TABS}
          value={controlledValue}
          labelText="Select category path"
          titleText="Controlled category"
          onChange={nextValue => setControlledValue(nextValue)}
          onOk={(_nextValue, params) => {
            setControlledSummary(
              joinLabels(params.path.map(item => item.labelText)),
            );
          }}
        />
        <Text color="description" size="sm">
          Selected: {controlledSummary}
        </Text>
      </Space>
    </>
  );
}

export default CascadePickerControlledDemo;
