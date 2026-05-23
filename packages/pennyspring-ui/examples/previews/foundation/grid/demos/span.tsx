import React from 'react';
import { View } from 'react-native';
import { Grid, Text } from '@pennyspring/ui';
import { DotsThreeIcon } from 'phosphor-react-native';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';

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

export const gridSpanDemoTitle = 'Span';

export function GridSpanDemo() {
  const styles = useStyles();
  const { token } = useTheme();

  return (
    <>
      <Grid
        columns={token.lineWidthBold + token.lineWidth}
        gap={[token.marginXS, token.marginSM]}
        style={styles.inlineGrid}
      >
        <Grid.Item span={token.lineWidthBold}>
          <View style={styles.cell}>
            <Text color="description" size="sm">
              Wide
            </Text>
            <Text color="heading" weight="strong">
              2 cols
            </Text>
          </View>
        </Grid.Item>
        <Grid.Item>
          <View style={styles.cell}>
            <DotsThreeIcon color={token.colorIcon} size={token.fontSizeXL} />
          </View>
        </Grid.Item>
      </Grid>
    </>
  );
}

export default GridSpanDemo;
