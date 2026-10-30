import React, { useState } from 'react';
import { Space, Column, Picker, Text } from '@pennyspring/ui';
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

const CATEGORY_COLUMN: PickerColumn = [
  { labelText: 'Food', value: 'food' },
  { labelText: 'Traffic', value: 'traffic' },
  { labelText: 'Shopping', value: 'shopping' },
  { labelText: 'Rent', value: 'rent' },
  { labelText: 'Utilities', value: 'utilities' },
  { labelText: 'Medical', value: 'medical' },
  { labelText: 'Insurance', value: 'insurance' },
  { labelText: 'Education', value: 'education' },
  { labelText: 'Entertainment', value: 'entertainment' },
  { labelText: 'Travel', value: 'travel' },
  { labelText: 'Gift', value: 'gift' },
  { labelText: 'Sports', value: 'sports' },
  { labelText: 'Subscriptions', value: 'subscriptions' },
  { labelText: 'Other', value: 'other' },
];

const EMPTY_COLUMN: PickerColumn = [];

function joinLabels(labels: Array<string | undefined>): string {
  const visibleLabels = labels.filter((label): label is string =>
    label !== undefined && label.length > 0,
  );

  if (visibleLabels.length === 0) {
    return 'None';
  }

  return visibleLabels.join(' / ');
}

export function PickerPopupPropsDemo() {
  const [clearCount, setClearCount] = useState(0);

  return (
    <>
      <Space block direction="vertical" size="large">
        <Picker
          allowClear
          columns={[ACCOUNT_COLUMN]}
          label="allowClear / onClear"
          labelText="Select and clear"
          popupProps={{ titleText: 'Clearable picker' }}
          onClear={() => {
            setClearCount(prev => prev + 1);
          }}
        />
        <Text color="description" size="sm">
          onClear count: {String(clearCount)}
        </Text>
        <Picker
          columns={[ACCOUNT_COLUMN]}
          label="renderLabel"
          labelText="Custom label"
          popupProps={{
            titleText: 'Custom label',
            renderLabel: item =>
              `${item.labelText ?? item.value} (${String(item.value)})`,
          }}
        />
        <Picker
          columns={[CATEGORY_COLUMN]}
          label="renderHeader"
          labelText="Custom header"
          popupProps={{
            titleText: 'Header',
            okText: 'Apply',
            renderHeader: ({ draftValue, header }) => (
              <Column>
                {header}
                <Text color="description" size="sm">
                  Draft: {joinLabels(draftValue.map(value => String(value)))}
                </Text>
              </Column>
            ),
          }}
        />
        <Picker
          columns={[EMPTY_COLUMN]}
          label="loading and empty"
          labelText="Loading state"
          popupProps={{
            loading: true,
            loadingIndicatorText: 'Loading options',
            emptyText: 'No options',
            titleText: 'Loading and empty',
          }}
        />
        <Picker
          columns={[ACCOUNT_COLUMN]}
          label="okDisabled"
          labelText="Cannot confirm"
          popupProps={{ okDisabled: true, titleText: 'Confirm disabled' }}
        />
      </Space>
    </>
  );
}

export default PickerPopupPropsDemo;
