import React from 'react';
import type { ImageStyle, StyleProp } from 'react-native';
import { Image, View } from 'react-native';
import { Grid, Tabs, Text } from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import {
  ASSET_CLASSIFICATION_TREE,
  type AssetClassificationIcon,
  type AssetClassificationTreeNode,
} from '../../../../../../src/constants/assetClassificationTree';
import {
  TYPE_ICON_TREE,
  type TypeIconGroupNode,
  type TypeIconNode,
  type TypeIconComponent,
} from '../../../../../../src/constants/typeIconTree';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';

type PreviewIconComponent = AssetClassificationIcon | TypeIconComponent;
type IconKind = 'asset' | 'type';
type RenderIconProps = {
  color?: string;
  size?: number;
  width?: number;
  height?: number;
  viewBox?: string;
};

interface IconCellItem {
  key: string;
  iconKind: IconKind;
  label: string;
  icon: PreviewIconComponent;
}

interface IconGridTabItem {
  value: string;
  label: string;
  items: readonly IconCellItem[];
}

const GRID_COLUMNS = 3;
const ASSET_ICON_VIEW_BOX = '0 0 1024 1024';
const ASSET_TAB_VALUE = 'asset-classification';

interface StyleOptions {
  iconSize: number;
}

const useStyles = createUseSheetStyle<StyleOptions>((token, { iconSize }) => ({
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
  imageIcon: {
    width: iconSize,
    height: iconSize,
  },
}));

function flattenAssetNodes(
  nodes: readonly AssetClassificationTreeNode[],
  parentKey = '',
): IconCellItem[] {
  return nodes.flatMap(node => {
    const nodeKey =
      parentKey.length > 0
        ? `${parentKey}-${String(node.value)}`
        : String(node.value);
    const current: IconCellItem = {
      key: nodeKey,
      iconKind: 'asset',
      label: node.label,
      icon: node.icon,
    };

    if (node.children === undefined) {
      return [current];
    }

    return [current, ...flattenAssetNodes(node.children, nodeKey)];
  });
}

function mapTypeIconItem(groupKey: string, item: TypeIconNode): IconCellItem {
  return {
    key: `${groupKey}-${item.value}`,
    iconKind: 'type',
    label: item.label,
    icon: item.icon,
  };
}

function mapTypeGroupTab(group: TypeIconGroupNode): IconGridTabItem {
  return {
    value: `type-${group.key}`,
    label: group.label,
    items: group.children.map(item => mapTypeIconItem(group.key, item)),
  };
}

const ICON_GRID_TABS: readonly IconGridTabItem[] = [
  {
    value: ASSET_TAB_VALUE,
    label: '资产分类树',
    items: flattenAssetNodes(ASSET_CLASSIFICATION_TREE),
  },
  ...TYPE_ICON_TREE.map(mapTypeGroupTab),
];

const ICON_GRID_TAB_ITEMS = ICON_GRID_TABS.map(({ label, value }) => ({
  label,
  value,
}));

const ICON_GRID_TAB_ITEM_MAP = new Map(
  ICON_GRID_TABS.map(tab => [tab.value, tab] as const),
);

function renderIcon(
  iconKind: IconKind,
  icon: PreviewIconComponent,
  iconColor: string | undefined,
  iconSize: number,
  styles: ReturnType<typeof useStyles>,
) {
  if (typeof icon === 'number') {
    return (
      <Image source={icon} style={styles.imageIcon as StyleProp<ImageStyle>} />
    );
  }

  const IconComponent = icon as React.ComponentType<RenderIconProps>;

  if (iconKind === 'asset') {
    return (
      <IconComponent
        height={iconSize}
        viewBox={ASSET_ICON_VIEW_BOX}
        width={iconSize}
      />
    );
  }

  return (
    <IconComponent
      color={iconColor}
      height={iconSize}
      size={iconSize}
      width={iconSize}
    />
  );
}

function renderGrid(
  items: readonly IconCellItem[],
  columns: number,
  iconSize: number,
  iconColor: string | undefined,
  styles: ReturnType<typeof useStyles>,
) {
  return (
    <Grid columns={columns} gap="small" style={styles.gridFrame}>
      {items.map(item => {
        return (
          <Grid.Item key={item.key}>
            <View style={styles.cell}>
              {renderIcon(
                item.iconKind,
                item.icon,
                iconColor,
                iconSize,
                styles,
              )}
              <Text
                color="heading"
                size="sm"
                weight="medium"
                style={styles.valueText}
              >
                {item.label}
              </Text>
            </View>
          </Grid.Item>
        );
      })}
    </Grid>
  );
}

export function ClassificationAndIconsPreview() {
  const { token } = useTheme();
  const columns = GRID_COLUMNS;
  const iconSize = token.fontSizeXL;
  const styles = useStyles({ iconSize });
  const iconColor = token.colorIcon;
  const defaultTabValue = ICON_GRID_TABS[0]?.value;

  return (
    <PreviewScaffold>
      <PreviewSection title="分类与图标（按分组切换）">
        <Tabs
          defaultValue={defaultTabValue}
          layout="scroll"
          items={ICON_GRID_TAB_ITEMS}
          renderContent={item => {
            const selectedTab = ICON_GRID_TAB_ITEM_MAP.get(String(item.value));
            if (selectedTab === undefined) {
              return null;
            }

            return renderGrid(
              selectedTab.items,
              columns,
              iconSize,
              iconColor,
              styles,
            );
          }}
        />
      </PreviewSection>
    </PreviewScaffold>
  );
}
