import React from 'react';
import { FlatList, View } from 'react-native';
import { Column, Input, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import * as PhosphorIcons from 'phosphor-react-native';
import type { Icon } from 'phosphor-react-native';

import { PHOSPHOR_ICON_INFO_LIST } from '../../constants/phosphorIconInfoList';
import { ASSET_CLASSIFICATION_TREE } from '../../constants/assetClassificationTree';
import type { AssetClassificationIcon } from '../../constants/assetClassificationTree';

const useStyles = createUseSheetStyle(token => ({
  container: {
    flex: 1,
    backgroundColor: token.colorBgLayout,
  },
  searchContainer: {
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingMD,
    backgroundColor: token.colorBgContainer,
  },
  listContent: {
    padding: token.padding,
  },
  iconItem: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: token.marginXXS,
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadius,
    borderWidth: token.lineWidth,
    borderColor: token.colorBorder,
  },
  iconName: {
    marginTop: token.marginXXS,
    textAlign: 'center',
    paddingHorizontal: token.paddingXXS,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: token.paddingXL,
  },
  sectionHeader: {
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingSM,
    backgroundColor: token.colorBgLayout,
  },
}));

interface PhosphorIconInfo {
  type: 'phosphor';
  pascalName: string;
  categories: string[];
  tags: string[];
  categoriesZh: string[];
  tagsZh: string[];
}

interface AssetIconInfo {
  type: 'asset';
  name: string;
  label: string;
  icon: AssetClassificationIcon;
}

type IconInfo = PhosphorIconInfo | AssetIconInfo;

interface IconItemProps {
  item: IconInfo;
}

function IconItem({ item }: IconItemProps) {
  const styles = useStyles();

  if (item.type === 'phosphor') {
    const IconComponent = (PhosphorIcons as any)[item.pascalName] as Icon;
    if (!IconComponent) {
      return null;
    }

    return (
      <Column style={styles.iconItem}>
        <IconComponent size={32} />
        <Text size="sm" color="secondary" style={styles.iconName} numberOfLines={1}>
          {item.pascalName}
        </Text>
      </Column>
    );
  }

  const AssetIcon = item.icon;
  return (
    <Column style={styles.iconItem}>
      <AssetIcon width={32} height={32} />
      <Text size="sm" color="secondary" style={styles.iconName} numberOfLines={1}>
        {item.label}
      </Text>
    </Column>
  );
}

function collectAssetIcons(): AssetIconInfo[] {
  const result: AssetIconInfo[] = [];

  function traverse(nodes: readonly any[], parentLabel = '') {
    for (const node of nodes) {
      const fullLabel = parentLabel ? `${parentLabel}/${node.label}` : node.label;
      result.push({
        type: 'asset',
        name: String(node.value),
        label: fullLabel,
        icon: node.icon,
      });
      if (node.children) {
        traverse(node.children, fullLabel);
      }
    }
  }

  traverse(ASSET_CLASSIFICATION_TREE);
  return result;
}

export function IconPreviewScreen() {
  const styles = useStyles();
  const [searchText, setSearchText] = React.useState('');

  const allIcons = React.useMemo<IconInfo[]>(() => {
    const phosphorIcons: PhosphorIconInfo[] = PHOSPHOR_ICON_INFO_LIST.map(icon => ({
      type: 'phosphor',
      ...icon,
    }));
    const assetIcons = collectAssetIcons();
    return [...phosphorIcons, ...assetIcons];
  }, []);

  const filteredIcons = React.useMemo(() => {
    if (!searchText.trim()) {
      return allIcons;
    }

    const lowerSearch = searchText.toLowerCase();
    return allIcons.filter(icon => {
      if (icon.type === 'phosphor') {
        const searchFields = [
          icon.pascalName.toLowerCase(),
          ...icon.categories.map(c => c.toLowerCase()),
          ...icon.categoriesZh,
          ...icon.tags.map(t => t.toLowerCase()),
          ...icon.tagsZh,
        ];
        return searchFields.some(field => field.includes(lowerSearch));
      } else {
        return (
          icon.name.toLowerCase().includes(lowerSearch) ||
          icon.label.toLowerCase().includes(lowerSearch)
        );
      }
    });
  }, [searchText, allIcons]);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Input
          placeholder="搜索图标名称、分类或标签"
          value={searchText}
          onChange={setSearchText}
          clearable
        />
      </View>

      <FlatList
        data={filteredIcons}
        renderItem={({ item }) => <IconItem item={item} />}
        keyExtractor={(item, index) =>
          item.type === 'phosphor' ? item.pascalName : `${item.name}-${index}`
        }
        numColumns={4}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text color="secondary">未找到匹配的图标</Text>
          </View>
        }
      />
    </View>
  );
}
