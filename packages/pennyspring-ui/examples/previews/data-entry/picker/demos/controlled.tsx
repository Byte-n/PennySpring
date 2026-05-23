import React from 'react';
import { Space, Picker, Text } from '@pennyspring/ui';
import type {
  PickerChangeParams,
  PickerColumn,
  PickerValue,
} from '@pennyspring/ui';

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

function joinLabels(labels: Array<string | undefined>): string {
  const visibleLabels = labels.filter((label): label is string =>
    label !== undefined && label.length > 0,
  );

  if (visibleLabels.length === 0) {
    return 'None';
  }

  return visibleLabels.join(' / ');
}

function getPickerSummary(params: PickerChangeParams): string {
  return joinLabels(params.items.map(item => item?.labelText));
}

export const pickerControlledDemoTitle = 'Controlled';

export function PickerControlledDemo() {
  const [controlledValue, setControlledValue] = React.useState<PickerValue[]>([
    'may',
    'food',
  ]);
  const [controlledSummary, setControlledSummary] =
    React.useState('May / Food');

  return (
    <>
      <Space block direction="vertical" size="large">
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
        <Text color="description" size="sm">
          Current: {controlledSummary}
        </Text>
      </Space>
    </>
  );
}

export default PickerControlledDemo;
