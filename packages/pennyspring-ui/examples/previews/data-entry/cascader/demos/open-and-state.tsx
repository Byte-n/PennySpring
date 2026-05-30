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

const EMPTY_OPTIONS: Array<CascaderOption<CategoryData>> = [];

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

export const cascaderOpenAndStateDemoTitle = 'Open and state';

export function CascaderOpenAndStateDemo() {
  const styles = useStyles();
  const [searchLikePath, setSearchLikePath] = React.useState<
    Array<string | number>
  >(['daily', 'food', 'breakfast']);

  return (
    <>
      <View style={styles.stack}>
        <Cascader
          options={CASCADER_OPTIONS}
          defaultValue={['daily', 'traffic', 'metro']}
          closeOnSelectLeaf={false}
          labelText="Select transport"
        >
          <TriggerContent
            label="closeOnSelectLeaf=false"
            value="Daily / Traffic / Metro"
          />
        </Cascader>
        <Cascader
          options={EMPTY_OPTIONS}
          emptyText="No options"
          labelText="Empty options"
        >
          <TriggerContent label="Empty state" value="No options" />
        </Cascader>
        <Cascader
          loading
          options={CASCADER_OPTIONS}
          labelText="Loading options"
        >
          <TriggerContent label="Loading state" value="Loading..." />
        </Cascader>
        <Cascader
          activeLevel={1}
          options={CASCADER_OPTIONS}
          value={searchLikePath}
          labelText="Active level = 1"
          onChange={nextValue => {
            setSearchLikePath(nextValue);
          }}
        >
          <TriggerContent label="activeLevel" value="Start from second tab" />
        </Cascader>
        <Cascader
          displayMode="tag"
          options={CASCADER_OPTIONS}
          defaultValue={['fixed', 'housing', 'utilities']}
          labelText="Tag mode"
        />
      </View>
    </>
  );
}

export default CascaderOpenAndStateDemo;
