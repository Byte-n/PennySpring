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

const GRID_GAP_SIZES = ['small', 'normal', 'large'] as const;

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

export function GridPreview() {
  const styles = useStyles();
  const { token } = useTheme();

  return (
    <PreviewScaffold>
      <PreviewSection title="Columns">
        <Grid columns={token.lineWidthBold + token.lineWidth} gap={token.marginXS} style={styles.gridFrame}>
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
      </PreviewSection>

      <PreviewSection title="Gap">
        <View style={styles.stack}>
          {GRID_GAP_SIZES.map(size => (
            <Grid key={size} columns={token.lineWidthBold + token.lineWidth} gap={size} style={styles.gridFrame}>
              {GRID_ITEMS.slice(0, 3).map(item => (
                <Grid.Item key={item.key}>
                  <View style={styles.cell}>
                    <Text color="description" size="sm">
                      {size}
                    </Text>
                    <Text color="heading" weight="strong">
                      {item.value}
                    </Text>
                  </View>
                </Grid.Item>
              ))}
            </Grid>
          ))}
          <Grid columns={token.lineWidthBold + token.lineWidth} gap={[token.marginXXS, token.marginSM]} style={styles.gridFrame}>
            {GRID_ITEMS.map(item => (
              <Grid.Item key={item.key}>
                <View style={styles.cell}>
                  <Text color="description" size="sm">
                    X/Y
                  </Text>
                  <Text color="heading" weight="strong">
                    {item.value}
                  </Text>
                </View>
              </Grid.Item>
            ))}
          </Grid>
        </View>
      </PreviewSection>

      <PreviewSection title="Span">
        <Grid columns={token.lineWidthBold + token.lineWidth} gap={[token.marginXS, token.marginSM]} style={styles.inlineGrid}>
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
      </PreviewSection>
    </PreviewScaffold>
  );
}
