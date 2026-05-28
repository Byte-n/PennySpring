import React from 'react';
import { View } from 'react-native';
import { Segmented } from '@pennyspring/ui';
import {
  ChartLineIcon,
  ListBulletsIcon,
  SquaresFourIcon,
} from 'phosphor-react-native';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export const segmentedOptionsDemoTitle = 'Options';

export function SegmentedOptionsDemo() {
  const styles = useStyles();
  const { token } = useTheme();

  return (
    <>
      <View style={styles.stack}>
        <Segmented options={['Day', 'Week', 'Month']} defaultValue="Week" />
        <Segmented
          defaultValue="list"
          options={[
            {
              value: 'list',
              labelText: 'List',
              icon: (
                <ListBulletsIcon
                  color={token.colorIcon}
                  size={token.fontSizeLG}
                />
              ),
            },
            {
              value: 'grid',
              labelText: 'Grid',
              icon: (
                <SquaresFourIcon
                  color={token.colorIcon}
                  size={token.fontSizeLG}
                />
              ),
            },
            {
              value: 'chart',
              labelText: 'Chart',
              icon: (
                <ChartLineIcon
                  color={token.colorIcon}
                  size={token.fontSizeLG}
                />
              ),
            },
          ]}
        />
      </View>
    </>
  );
}

export default SegmentedOptionsDemo;
