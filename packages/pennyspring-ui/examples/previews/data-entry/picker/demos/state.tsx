import React from 'react';
import { Space, Picker } from '@pennyspring/ui';
import type { PickerColumn } from '@pennyspring/ui';

const ACCOUNT_COLUMN: PickerColumn = [
  { labelText: 'Cash', value: 'cash' },
  { labelText: 'Primary card', value: 'card' },
  { labelText: 'Savings', value: 'saving', disabled: true },
  { labelText: 'Salary card', value: 'salary-card' },
  { labelText: 'Travel card', value: 'travel-card' },
  { labelText: 'USD wallet', value: 'usd-wallet' },
  { labelText: 'HKD wallet', value: 'hkd-wallet' },
  { labelText: 'Digital wallet', value: 'digital-wallet' },
  { labelText: 'Investment account', value: 'investment-account' },
  { labelText: 'Emergency fund', value: 'emergency-fund' },
  { labelText: 'Family account', value: 'family-account' },
  { labelText: 'Trip budget', value: 'trip-budget' },
  { labelText: 'Petty cash', value: 'petty-cash' },
];

const EMPTY_COLUMN: PickerColumn = [];

export const pickerStateDemoTitle = 'State';

export function PickerStateDemo() {
  return (
    <>
      <Space block direction="vertical" size="large">
        <Picker
          disabled
          columns={[ACCOUNT_COLUMN]}
          label="Disabled"
          placeholder="Not selectable"
          popupProps={{ titleText: 'Disabled' }}
        />
        <Picker
          readonly
          columns={[ACCOUNT_COLUMN]}
          defaultValue={['salary-card']}
          label="Readonly"
          placeholder="Cannot open"
          popupProps={{ titleText: 'Readonly' }}
        />
        <Picker
          columns={[EMPTY_COLUMN]}
          label="Empty"
          placeholder="No options"
          popupProps={{ emptyText: 'No accounts', titleText: 'Empty picker' }}
        />
      </Space>
    </>
  );
}

export default PickerStateDemo;
