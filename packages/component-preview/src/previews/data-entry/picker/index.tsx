import React, { useState } from 'react';
import { Column, Icon, Picker, Text } from '@pennyspring/component';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import {
  InlineValue,
  PreviewStack,
  TriggerContent,
  joinLabels,
} from '../pickerPreviewShared';
import type {
  PickerChangeParams,
  PickerColumn,
  PickerValue,
} from '@pennyspring/component';

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

const EMPTY_COLUMN: PickerColumn = [];

function getPickerSummary(params: PickerChangeParams): string {
  return joinLabels(params.items.map(item => item?.labelText));
}

export function PickerPreview() {
  const [controlledValue, setControlledValue] = React.useState<PickerValue[]>([
    'may',
    'food',
  ]);
  const [controlledSummary, setControlledSummary] =
    React.useState('May / Food');

  const [account1, setAccount1] = useState<string[]>();
  const [clearCount, setClearCount] = useState(0);

  return (
    <PreviewScaffold>
      <PreviewSection title="Basic">
        <PreviewStack>
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
        </PreviewStack>
      </PreviewSection>

      <PreviewSection title="Popup props">
        <PreviewStack>
          <Picker
            allowClear
            columns={[ACCOUNT_COLUMN]}
            label="allowClear / onClear"
            placeholder="Select and clear"
            popupProps={{ titleText: 'Clearable picker' }}
            onClear={() => {
              setClearCount(prev => prev + 1);
            }}
          />
          <InlineValue label="onClear count" value={String(clearCount)} />
          <Picker
            columns={[ACCOUNT_COLUMN]}
            label="renderLabel"
            placeholder="Custom label"
            popupProps={{
              titleText: 'Custom label',
              renderLabel: item => `${item.labelText ?? item.value} (${String(item.value)})`,
            }}
          />
          <Picker
            columns={[CATEGORY_COLUMN]}
            label="renderHeader"
            placeholder="Custom header"
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
            placeholder="Loading state"
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
            placeholder="Cannot confirm"
            popupProps={{ okDisabled: true, titleText: 'Confirm disabled' }}
          />
        </PreviewStack>
      </PreviewSection>

      <PreviewSection title="Controlled">
        <PreviewStack>
          <Picker
            allowClear
            columns={[MONTH_COLUMN, CATEGORY_COLUMN]}
            label="Controlled value"
            value={controlledValue}
            onChange={(nextValue, params) => {
              setControlledValue(nextValue);
              setControlledSummary(getPickerSummary(params));
            }}
            popupProps={{ titleText: 'Controlled picker' }}
          />
          <InlineValue label="Current" value={controlledSummary} />
        </PreviewStack>
      </PreviewSection>

      <PreviewSection title="State">
        <PreviewStack>
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
        </PreviewStack>
      </PreviewSection>
    </PreviewScaffold>
  );
}
