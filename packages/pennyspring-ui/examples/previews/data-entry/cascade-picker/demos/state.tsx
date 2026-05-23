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

export const cascadePickerStateDemoTitle = 'State';

export function CascadePickerStateDemo() {
  return (
    <>
      <Space block direction="vertical" size="large">
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
          renderLabel={item =>
            item.labelText
              ? `${item.labelText} - ${String(item.value)}`
              : String(item.value)
          }
        />
      </Space>
    </>
  );
}

export default CascadePickerStateDemo;
