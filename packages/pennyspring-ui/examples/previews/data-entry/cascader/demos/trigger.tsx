import React from 'react';
import { View } from 'react-native';
import { Cascader, DisplayInput } from '@pennyspring/ui';
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
}));

interface TriggerContentProps {
  label: string;
  value: string;
}

function TriggerContent({ label, value }: TriggerContentProps) {
  return (
    <DisplayInput labelText={label} readonly valueText={value} />
  );
}

export const cascaderTriggerDemoTitle = 'Trigger';

export function CascaderTriggerDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        <Cascader
          options={CASCADER_OPTIONS}
          defaultValue={['daily', 'food', 'breakfast']}
          placeholder="Select category"
        >
          <TriggerContent
            label="Three levels"
            value="Daily / Food / Breakfast"
          />
        </Cascader>
        <Cascader
          options={CASCADER_OPTIONS}
          defaultValue={['fixed', 'housing', 'rent']}
          placeholder="Select fixed expense"
        >
          <TriggerContent
            label="Default value"
            value="Fixed / Housing / Rent"
          />
        </Cascader>
        <Cascader disabled options={CASCADER_OPTIONS} placeholder="Disabled">
          <TriggerContent label="Disabled" value="Not selectable" />
        </Cascader>
        <Cascader readonly options={CASCADER_OPTIONS} placeholder="Readonly">
          <TriggerContent label="Readonly" value="Cannot open panel" />
        </Cascader>
      </View>
    </>
  );
}

export default CascaderTriggerDemo;
