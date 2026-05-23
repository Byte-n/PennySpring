import React, { useState } from 'react';
import { Space, Column, Icon, Picker, Text } from '@pennyspring/ui';
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

const MONTH_COLUMN: PickerColumn = [
  { labelText: 'January', value: 'january' },
  { labelText: 'February', value: 'february' },
  { labelText: 'March', value: 'march' },
  { labelText: 'April', value: 'april' },
  { labelText: 'May', value: 'may' },
  { labelText: 'June', value: 'june' },
  { labelText: 'July', value: 'july' },
  { labelText: 'August', value: 'august' },
  { labelText: 'September', value: 'september' },
  { labelText: 'October', value: 'october' },
  { labelText: 'November', value: 'november' },
  { labelText: 'December', value: 'december' },
];

export const pickerBasicDemoTitle = 'Basic';

interface TriggerContentProps {
  label: string;
  value: string;
  meta?: string;
}

function TriggerContent({ label, meta, value }: TriggerContentProps) {
  return (
    <Column>
      <Text color="description" size="sm">{label}</Text>
      <Text color="heading" weight="strong">{value}</Text>
      {meta ? <Text color="description" size="sm">{meta}</Text> : null}
    </Column>
  );
}

export function PickerBasicDemo() {
  const [account1, setAccount1] = useState<string[]>();

  return (
    <>
      <Space block direction="vertical" size="large">
        <Picker
          allowClear
          label="Account"
          placeholder="Select account"
          columns={[ACCOUNT_COLUMN]}
          popupProps={{ titleText: 'Account' }}
          value={account1}
          onChange={v => setAccount1(v as string[])}
        />
        <Picker
          allowClear
          label="Account"
          placeholder="Select account"
          columns={[ACCOUNT_COLUMN]}
          popupProps={{ titleText: 'Account' }}
          value={account1}
          onChange={v => setAccount1(v as string[])}
        >
          <Icon icon="info" />
          <Text color={account1?.length ? 'default' : 'placeholder'}>
            {account1?.length ? account1.join(' / ') : '点击进行选择'}
          </Text>
        </Picker>
        <Picker
          allowClear
          columns={[MONTH_COLUMN, CATEGORY_COLUMN]}
          defaultValue={['may', 'food']}
          placeholder="Select month and category"
          label="Month category"
          popupProps={{ titleText: 'Month and category' }}
        />
        <Picker
          columns={[ACCOUNT_COLUMN]}
          defaultValue={['cash']}
          placeholder="Custom trigger"
          popupProps={{ titleText: 'Custom trigger' }}
        >
          <TriggerContent
            label="Custom trigger"
            value="Cash"
            meta="Uses the picker trigger slot"
          />
        </Picker>
      </Space>
    </>
  );
}

export default PickerBasicDemo;
