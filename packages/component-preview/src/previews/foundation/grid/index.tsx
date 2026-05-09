import React from 'react';
import { View } from 'react-native';
import { Grid, Text } from '@pennyspring/component';
import { DotsThreeIcon } from 'phosphor-react-native';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';

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
  tile: {
    minHeight: token.controlHeightLG + token.controlHeight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: token.marginXXS,
    borderWidth: token.lineWidth,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorBgContainer,
  },
  inlineGrid: {
    borderWidth: token.lineWidth,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorBgContainer,
  },
}));

export function GridPreview() {
  const styles = useStyles();
  const { token } = useTheme();

  return (
    <PreviewScaffold>
      <PreviewSection title="Columns">
        <Grid columns={token.lineWidthBold + token.lineWidth} gap={token.marginXS}>
          {GRID_ITEMS.map(item => (
            <Grid.Item key={item.key}>
              <View style={styles.tile}>
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
      </PreviewSection>

      <PreviewSection title="Span">
        <Grid columns={token.lineWidthBold + token.lineWidth} gap={[token.marginXS, token.marginSM]} style={styles.inlineGrid}>
          <Grid.Item span={token.lineWidthBold}>
            <View style={styles.tile}>
              <Text color="description" size="sm">
                Wide
              </Text>
              <Text color="heading" weight="strong">
                2 cols
              </Text>
            </View>
          </Grid.Item>
          <Grid.Item>
            <View style={styles.tile}>
              <DotsThreeIcon color={token.colorIcon} size={token.fontSizeXL} />
            </View>
          </Grid.Item>
        </Grid>
      </PreviewSection>
    </PreviewScaffold>
  );
}
