import React from 'react';
import type { ImageStyle, StyleProp } from 'react-native';
import { Image, ScrollView, View } from 'react-native';
import { Grid, Tabs, Text } from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';

import {
  ASSET_CLASSIFICATION_TREE,
  type AssetClassificationIcon,
  type AssetClassificationTreeNode,
} from '../../constants/assetClassificationTree';
import {
  TYPE_ICON_TREE,
  type TypeIconComponent,
  type TypeIconGroupNode,
  type TypeIconNode,
} from '../../constants/typeIconTree';

type PreviewIconComponent = AssetClassificationIcon | TypeIconComponent;

type IconKind = 'asset' | 'type';

type RenderIconProps = {
  color?: string;
  height?: number;
  size?: number;
  viewBox?: string;
  width?: number;
};

interface IconCellItem {
  icon: PreviewIconComponent;
  iconKind: IconKind;
  key: string;
  label: string;
}

interface IconGridTabItem {
  items: readonly IconCellItem[];
  label: string;
  value: string;
}

interface StyleOptions {
  iconSize: number;
}

const GRID_COLUMNS = 3;
const ASSET_ICON_VIEW_BOX = '0 0 1024 1024';
const ASSET_TAB_VALUE = 'asset-classification';

const useStyles = createUseSheetStyle<StyleOptions>((token, { iconSize }) => ({
  cell: {
    alignItems: 'center',
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorBorder,
    borderRadius: token.borderRadiusSM,
    borderWidth: token.lineWidth,
    gap: token.marginXXS,
    justifyContent: 'center',
    minHeight: token.controlHeightLG + token.controlHeight,
    paddingHorizontal: token.paddingSM,
  },
  content: {
    gap: token.marginLG,
    padding: token.padding,
  },
  gridFrame: {
    backgroundColor: token.colorFillTertiary,
    borderRadius: token.borderRadius,
  },
  imageIcon: {
    height: iconSize,
    width: iconSize,
  },
  section: {
    gap: token.paddingXS,
  },
  sectionTitle: {
    marginBottom: token.marginXXS,
  },
  valueText: {
    textAlign: 'center',
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
      icon: node.icon,
      iconKind: 'asset',
      key: nodeKey,
      label: node.label,
    };

    if (node.children === undefined) {
      return [current];
    }

    return [current, ...flattenAssetNodes(node.children, nodeKey)];
  });
}

function mapTypeIconItem(groupKey: string, item: TypeIconNode): IconCellItem {
  return {
    icon: item.icon,
    iconKind: 'type',
    key: `${groupKey}-${item.value}`,
    label: item.label,
  };
}

function mapTypeGroupTab(group: TypeIconGroupNode): IconGridTabItem {
  return {
    items: group.children.map(item => mapTypeIconItem(group.key, item)),
    label: group.label,
    value: `type-${group.key}`,
  };
}

const ICON_GRID_TABS: readonly IconGridTabItem[] = [
  {
    items: flattenAssetNodes(ASSET_CLASSIFICATION_TREE),
    label: '资产分类树',
    value: ASSET_TAB_VALUE,
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
  iconSize: number,
  iconColor: string | undefined,
  styles: ReturnType<typeof useStyles>,
) {
  return (
    <Grid columns={GRID_COLUMNS} gap="small" style={styles.gridFrame}>
      {items.map(item => (
        <Grid.Item key={item.key}>
          <View style={styles.cell}>
            {renderIcon(item.iconKind, item.icon, iconColor, iconSize, styles)}
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
      ))}
    </Grid>
  );
}

export function BusinessPreviewScreen() {
  const { token } = useTheme();
  const iconSize = token.fontSizeXL;
  const styles = useStyles({ iconSize });
  const iconColor = token.colorIcon;
  const defaultTabValue = ICON_GRID_TABS[0]?.value;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text
          color="heading"
          size="h5"
          weight="strong"
          style={styles.sectionTitle}
        >
          分类与图标
        </Text>
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
              iconSize,
              iconColor,
              styles,
            );
          }}
        />
      </View>
    </ScrollView>
  );
}
