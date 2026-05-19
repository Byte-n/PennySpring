import React from 'react';
import { View } from 'react-native';
import { Cascader, Text } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import type { CascaderOption } from '@pennyspring/component';

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
          { labelText: 'Breakfast', value: 'breakfast', data: { code: 'D-F-B' } },
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
          { labelText: 'Utilities', value: 'utilities', data: { code: 'F-H-U' } },
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
      <Text color="description" size="sm">{label}</Text>
      <Text color="heading" weight="strong">{value}</Text>
    </View>
  );
}

export function CascaderPreview() {
  const styles = useStyles();
  const [searchLikePath, setSearchLikePath] = React.useState<Array<string | number>>([
    'daily',
    'food',
    'breakfast',
  ]);

  return (
    <PreviewScaffold>
      <PreviewSection title="Trigger">
        <View style={styles.stack}>
          <Cascader
            options={CASCADER_OPTIONS}
            defaultValue={['daily', 'food', 'breakfast']}
            placeholder="Select category"
          >
            <TriggerContent label="Three levels" value="Daily / Food / Breakfast" />
          </Cascader>
          <Cascader
            options={CASCADER_OPTIONS}
            defaultValue={['fixed', 'housing', 'rent']}
            placeholder="Select fixed expense"
          >
            <TriggerContent label="Default value" value="Fixed / Housing / Rent" />
          </Cascader>
          <Cascader disabled options={CASCADER_OPTIONS} placeholder="Disabled">
            <TriggerContent label="Disabled" value="Not selectable" />
          </Cascader>
          <Cascader readonly options={CASCADER_OPTIONS} placeholder="Readonly">
            <TriggerContent label="Readonly" value="Cannot open panel" />
          </Cascader>
        </View>
      </PreviewSection>

      <PreviewSection title="Open and state">
        <View style={styles.stack}>
          <Cascader
            options={CASCADER_OPTIONS}
            defaultValue={['daily', 'traffic', 'metro']}
            closeOnSelectLeaf={false}
            placeholder="Select transport"
          >
            <TriggerContent label="closeOnSelectLeaf=false" value="Daily / Traffic / Metro" />
          </Cascader>
          <Cascader options={EMPTY_OPTIONS} emptyText="No options" placeholder="Empty options">
            <TriggerContent label="Empty state" value="No options" />
          </Cascader>
          <Cascader loading options={CASCADER_OPTIONS} placeholder="Loading options">
            <TriggerContent label="Loading state" value="Loading..." />
          </Cascader>
          <Cascader
            activeLevel={1}
            options={CASCADER_OPTIONS}
            value={searchLikePath}
            placeholder="Active level = 1"
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
            placeholder="Tag mode"
          />
        </View>
      </PreviewSection>

      <PreviewSection title="Size">
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
      </PreviewSection>
    </PreviewScaffold>
  );
}
