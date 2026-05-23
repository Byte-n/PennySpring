import React from 'react';
import { Space, CascadePicker } from '@pennyspring/ui';
import type { CascadePickerTab } from '@pennyspring/ui';

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

export const cascadePickerBasicDemoTitle = 'Basic';

export function CascadePickerBasicDemo() {
  return (
    <>
      <Space block direction="vertical" size="large">
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
      </Space>
    </>
  );
}

export default CascadePickerBasicDemo;
