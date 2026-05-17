import React from 'react';
import { View } from 'react-native';
import { Picker } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import type { PickerColumn } from '@pennyspring/component';

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

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export function PickerPreview() {
  const styles = useStyles();

  return (
    <PreviewScaffold>
      <PreviewSection title="Trigger">
        <View style={styles.stack}>
          <Picker
            allowClear
            label="Account"
            placeholder="Single column"
            columns={[ACCOUNT_COLUMN]}
            popupProps={{ titleText: 'Account' }}
          />
          <Picker
            allowClear
            columns={[MONTH_COLUMN, CATEGORY_COLUMN]}
            defaultValue={['may', 'food']}
            placeholder="请输入"
            label="MC"
            popupProps={{ titleText: 'Month and category' }}
          />
          <Picker
            disabled
            columns={[ACCOUNT_COLUMN]}
            placeholder="placeholder"
            popupProps={{ titleText: 'Disabled' }}
          />
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
