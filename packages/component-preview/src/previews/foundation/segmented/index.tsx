import React from 'react';
import { View } from 'react-native';
import { Segmented, Text } from '@pennyspring/component';
import {
  ChartLineIcon,
  ListBulletsIcon,
  SquaresFourIcon,
} from 'phosphor-react-native';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import type { SegmentedValue } from '@pennyspring/component';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export function SegmentedPreview() {
  const styles = useStyles();
  const { token } = useTheme();
  const [value, setValue] = React.useState<SegmentedValue>('week');

  return (
    <PreviewScaffold>
      <PreviewSection title="Options">
        <View style={styles.stack}>
          <Segmented options={['Day', 'Week', 'Month']} defaultValue="Week" />
          <Segmented
            defaultValue="list"
            options={[
              {
                value: 'list',
                label: 'List',
                icon: <ListBulletsIcon color={token.colorIcon} size={token.fontSizeLG} />,
              },
              {
                value: 'grid',
                label: 'Grid',
                icon: <SquaresFourIcon color={token.colorIcon} size={token.fontSizeLG} />,
              },
              {
                value: 'chart',
                label: 'Chart',
                icon: <ChartLineIcon color={token.colorIcon} size={token.fontSizeLG} />,
              },
            ]}
          />
        </View>
      </PreviewSection>

      <PreviewSection title="Size and disabled">
        <View style={styles.stack}>
          <Segmented size="small" options={['Small', 'Normal', 'Large']} defaultValue="Small" />
          <Segmented size="large" options={['Small', 'Normal', 'Large']} defaultValue="Large" />
          <Segmented
            options={[
              { value: 'cash', label: 'Cash' },
              { value: 'card', label: 'Card', disabled: true },
              { value: 'saving', label: 'Saving' },
            ]}
            defaultValue="cash"
          />
          <Segmented disabled options={['Disabled', 'State']} defaultValue="Disabled" />
        </View>
      </PreviewSection>

      <PreviewSection title="Controlled block">
        <View style={styles.stack}>
          <Segmented
            block
            value={value}
            onChange={setValue}
            options={[
              { value: 'day', label: 'Day' },
              { value: 'week', label: 'Week' },
              { value: 'month', label: 'Month' },
            ]}
          />
          <Text color="description" size="sm">Selected: {String(value)}</Text>
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
