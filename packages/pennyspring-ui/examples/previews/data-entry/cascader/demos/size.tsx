import React from 'react';
import { View } from 'react-native';
import { Cascader, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import type { CascaderOption } from '@pennyspring/ui';

interface CategoryData {
  code: string;
}

const CASCADER_OPTIONS: Array<CascaderOption<CategoryData>> = [
  {
    labelText: 'Daily',
    value: 'daily',
    data: { code: 'D' },
    children: [
      {
        labelText: 'Food',
        value: 'food',
        data: { code: 'D-F' },
        children: [
          {
            labelText: 'Breakfast',
            value: 'breakfast',
            data: { code: 'D-F-B' },
          },
          { labelText: 'Dinner', value: 'dinner', data: { code: 'D-F-D' } },
        ],
      },
      {
        labelText: 'Traffic',
        value: 'traffic',
        data: { code: 'D-T' },
        children: [
          { labelText: 'Metro', value: 'metro', data: { code: 'D-T-M' } },
          { labelText: 'Taxi', value: 'taxi', data: { code: 'D-T-T' } },
        ],
      },
    ],
  },
  {
    labelText: 'Fixed',
    value: 'fixed',
    data: { code: 'F' },
    children: [
      {
        labelText: 'Housing',
        value: 'housing',
        data: { code: 'F-H' },
        children: [
          { labelText: 'Rent', value: 'rent', data: { code: 'F-H-R' } },
          {
            labelText: 'Utilities',
            value: 'utilities',
            data: { code: 'F-H-U' },
          },
        ],
      },
    ],
  },
];

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
  triggerContent: {
    gap: token.marginXXS,
  },
}));

interface TriggerContentProps {
  label: string;
  value: string;
}

function TriggerContent({ label, value }: TriggerContentProps) {
  const styles = useStyles();

  return (
    <View style={styles.triggerContent}>
      <Text color="description" size="sm">
        {label}
      </Text>
      <Text color="heading" weight="strong">
        {value}
      </Text>
    </View>
  );
}

export const cascaderSizeDemoTitle = 'Size';

export function CascaderSizeDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        <Cascader
          size="small"
          options={CASCADER_OPTIONS}
          defaultValue={['daily', 'food', 'breakfast']}
        >
          <TriggerContent label="Small" value="Daily / Food / Breakfast" />
        </Cascader>
        <Cascader
          size="large"
          options={CASCADER_OPTIONS}
          defaultValue={['fixed', 'housing', 'utilities']}
        >
          <TriggerContent label="Large" value="Fixed / Housing / Utilities" />
        </Cascader>
      </View>
    </>
  );
}

export default CascaderSizeDemo;
