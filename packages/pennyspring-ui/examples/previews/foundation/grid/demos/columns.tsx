import React from 'react';
import { View } from 'react-native';
import { Grid, Text } from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/ui';

interface GridDemoItem {
  key: string;
  title: string;
  value: string;
}

const GRID_ITEMS: GridDemoItem[] = [
  { key: 'today', title: 'Today', value: '12' },
  { key: 'week', title: 'Week', value: '48' },
  { key: 'month', title: 'Month', value: '128' },
  { key: 'year', title: 'Year', value: '856' },
];

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
  cell: {
    minHeight: token.controlHeightLG + token.controlHeight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: token.marginXXS,
    paddingHorizontal: token.paddingSM,
    borderWidth: token.lineWidth,
    borderColor: token.colorBorder,
    borderRadius: token.borderRadiusSM,
    backgroundColor: token.colorBgContainer,
  },
  inlineGrid: {
    borderWidth: token.lineWidth,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorFillTertiary,
  },
  gridFrame: {
    backgroundColor: token.colorFillTertiary,
  },
}));

export function GridColumnsDemo() {
  const styles = useStyles();
  const { token } = useTheme();

  return (
    <>
      <Grid
        columns={token.lineWidthBold + token.lineWidth}
        gap="normal"
        style={styles.gridFrame}
      >
        {GRID_ITEMS.map(item => (
          <Grid.Item key={item.key}>
            <View style={styles.cell}>
              <Text color="description" size="sm">
                {item.title}
              </Text>
              <Text color="heading" weight="strong">
                {item.value}
              </Text>
            </View>
          </Grid.Item>
        ))}
      </Grid>
    </>
  );
}

export default GridColumnsDemo;
