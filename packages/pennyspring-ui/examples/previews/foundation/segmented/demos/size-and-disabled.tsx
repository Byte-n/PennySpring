import React from 'react';
import { View } from 'react-native';
import { Segmented } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export const segmentedSizeAndDisabledDemoTitle = 'Size and disabled';

export function SegmentedSizeAndDisabledDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        <Segmented
          size="small"
          options={['Small', 'Normal', 'Large']}
          defaultValue="Small"
        />
        <Segmented
          size="large"
          options={['Small', 'Normal', 'Large']}
          defaultValue="Large"
        />
        <Segmented
          options={[
            { value: 'cash', labelText: 'Cash' },
            { value: 'card', labelText: 'Card', disabled: true },
            { value: 'saving', labelText: 'Saving' },
          ]}
          defaultValue="cash"
        />
        <Segmented
          disabled
          options={['Disabled', 'State']}
          defaultValue="Disabled"
        />
      </View>
    </>
  );
}

export default SegmentedSizeAndDisabledDemo;
