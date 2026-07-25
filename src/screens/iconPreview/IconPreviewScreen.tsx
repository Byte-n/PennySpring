import React from 'react';
import { FlatList, View } from 'react-native';
import { Column, Input, Row, SelectionList, Text } from '@pennyspring/ui';
import type { SelectionListOption, SelectionListSelectedValue } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import * as PhosphorIcons from 'phosphor-react-native';
import type { Icon } from 'phosphor-react-native';

import { PHOSPHOR_ICON_INFO_LIST } from '../../constants/phosphorIconInfoList';
import { ASSET_CLASSIFICATION_TREE } from '../../constants/assetClassificationTree';
import type { AssetClassificationIcon, AssetTypeValue } from '../../constants/assetClassificationTree';

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
  filterRow: {
    gap: token.paddingXS,
  },
  categorySelection: {
    flex: 0,
    minWidth: 120,
  },
  searchInput: {
    flex: 1,
  },
  listContent: {
    padding: token.padding,
  },
  iconItem: {
    width: '23%',
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

function collectAssetIcons(categoryFilter?: AssetTypeValue): AssetIconInfo[] {
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

  if (categoryFilter) {
    const filteredTree = ASSET_CLASSIFICATION_TREE.filter(
      node => node.value === categoryFilter
    );
    traverse(filteredTree);
  } else {
    traverse(ASSET_CLASSIFICATION_TREE);
  }
  return result;
}

function getAllPhosphorCategories(): Array<{ en: string; zh: string }> {
  const categoryMap = new Map<string, string>();
  for (const icon of PHOSPHOR_ICON_INFO_LIST) {
    for (let i = 0; i < icon.categories.length; i++) {
      const enCategory = icon.categories[i];
      const zhCategory = icon.categoriesZh[i];
      if (enCategory && zhCategory) {
        categoryMap.set(enCategory, zhCategory);
      }
    }
  }
  return Array.from(categoryMap.entries())
    .map(([en, zh]) => ({ en, zh }))
    .sort((a, b) => a.en.localeCompare(b.en));
}

const PHOSPHOR_CATEGORIES = getAllPhosphorCategories();

const CATEGORY_OPTIONS: SelectionListOption[] = [
  ...PHOSPHOR_CATEGORIES.map(category => ({
    value: `phosphor:${category.en}`,
    label: (
      <Row gap={6}>
        <Text>{category.zh}</Text>
        <Text color="tertiary">{category.en}</Text>
      </Row>
    ),
    labelText: category.zh,
  })),
  ...ASSET_CLASSIFICATION_TREE.map(node => ({
    value: node.value,
    label: (
      <Row gap={6}>
        <Text>{node.label}</Text>
        <Text color="tertiary">{node.value}</Text>
      </Row>
    ),
  })),
];

export function IconPreviewScreen() {
  const styles = useStyles();
  const [searchText, setSearchText] = React.useState('');
  const [category, setCategory] = React.useState<string | number>(CATEGORY_OPTIONS[0]?.value ?? '');

  const handleCategoryChange = React.useCallback((value: SelectionListSelectedValue) => {
    if (Array.isArray(value)) {
      setCategory(value[0] ?? CATEGORY_OPTIONS[0]?.value ?? '');
    } else {
      setCategory(value);
    }
  }, []);

  const allIcons = React.useMemo<IconInfo[]>(() => {
    const phosphorIcons: PhosphorIconInfo[] = PHOSPHOR_ICON_INFO_LIST.map(icon => ({
      type: 'phosphor',
      ...icon,
    }));

    const categoryStr = String(category);

    if (categoryStr.startsWith('phosphor:')) {
      const phosphorCategory = categoryStr.replace('phosphor:', '');
      const filteredPhosphor = phosphorIcons.filter(icon =>
        icon.categories.includes(phosphorCategory)
      );
      return filteredPhosphor;
    }

    const assetTypeFilter = category as AssetTypeValue;
    const assetIcons = collectAssetIcons(assetTypeFilter);
    return assetIcons;
  }, [category]);

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
        <Row style={styles.filterRow}>
          <SelectionList
            style={styles.categorySelection}
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={handleCategoryChange}
            texts={{
              headerText: '选择分类',
              closeText: '关闭',
            }}
            labelText='分类'
          />
          <Input
            style={styles.searchInput}
            placeholder="搜索图标名称、分类或标签"
            value={searchText}
            onChange={setSearchText}
            clearable
          />
        </Row>
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
