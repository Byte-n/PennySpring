import React from 'react';
import { View } from 'react-native';
import { Grid, Text } from '@pennyspring/component';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import {
  ASSET_CLASSIFICATION_TREE,
  type AssetClassificationIcon,
  type AssetClassificationTreeNode,
} from '../../../../../../src/constants/assetClassificationTree';
import {
  TYPE_ICON_TREE,
  type TypeIconComponent,
} from '../../../../../../src/constants/typeIconTree';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';

type PreviewIconComponent = AssetClassificationIcon | TypeIconComponent;
type RenderIconProps = {
  color?: string;
  size?: number;
  width?: number;
  height?: number;
};

interface IconCellItem {
  key: string;
  label: string;
  value: string;
  icon: PreviewIconComponent;
}

const GRID_COLUMNS_BASE = 4;

const useStyles = createUseSheetStyle(token => ({
  groupStack: {
    gap: token.marginXS,
  },
  gridFrame: {
    backgroundColor: token.colorFillTertiary,
    borderRadius: token.borderRadius,
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
  valueText: {
    textAlign: 'center',
  },
}));

function flattenAssetNodes(nodes: readonly AssetClassificationTreeNode[]): IconCellItem[] {
  return nodes.flatMap(node => {
    const current: IconCellItem = {
      key: String(node.value),
      label: node.label,
      value: String(node.value),
      icon: node.icon,
    };

    if (node.children === undefined) {
      return [current];
    }

    return [current, ...flattenAssetNodes(node.children)];
  });
}

function renderGrid(
  items: readonly IconCellItem[],
  columns: number,
  iconSize: number,
  iconColor: string,
  styles: ReturnType<typeof useStyles>,
) {
  return (
    <Grid columns={columns} gap="small" style={styles.gridFrame}>
      {items.map(item => {
        const ItemIcon = item.icon as React.ComponentType<RenderIconProps>;

        return (
          <Grid.Item key={item.key}>
            <View style={styles.cell}>
              <ItemIcon
                color={iconColor}
                height={iconSize}
                size={iconSize}
                width={iconSize}
              />
              <Text
                color="heading"
                size="sm"
                weight="medium"
                style={styles.valueText}
              >
                {item.label}
              </Text>
              <Text color="description" size="sm" style={styles.valueText}>
                {item.value}
              </Text>
            </View>
          </Grid.Item>
        );
      })}
    </Grid>
  );
}

export function ClassificationAndIconsPreview() {
  const styles = useStyles();
  const { token } = useTheme();
  const columns = token.lineWidthBold + GRID_COLUMNS_BASE;
  const iconSize = token.fontSizeXL;
  const iconColor = token.colorIcon;
  const assetItems = flattenAssetNodes(ASSET_CLASSIFICATION_TREE);

  return (
    <PreviewScaffold>
      <PreviewSection title="资产分类树（全部）">
        {renderGrid(assetItems, columns, iconSize, iconColor, styles)}
      </PreviewSection>

      <PreviewSection title="类型图标分类（按分组）">
        <View style={styles.groupStack}>
          {TYPE_ICON_TREE.map(group =>
            <PreviewSection key={group.key} title={group.label}>
                {renderGrid(
                  group.children.map(item => ({
                    key: `${group.key}-${item.value}`,
                    label: item.label,
                    value: String(item.value),
                    icon: item.icon,
                  })),
                  columns,
                  iconSize,
                  iconColor,
                  styles,
                )}
            </PreviewSection>,
          )}
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
