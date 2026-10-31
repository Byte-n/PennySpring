import React, { useMemo, useState } from 'react';
import { Pressable } from 'react-native';
import {
  Column,
  List,
  Icon,
  Input,
  Popup,
  Row,
  Text,
} from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';

import {
  getPhosphorIconComponent,
  PHOSPHOR_ICON_OPTIONS,
  type PhosphorIconOption,
} from '../constants/typeIconTree';

interface PhosphorIconPickerProps {
  open: boolean;
  value?: string;
  titleText?: string;
  onChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
}

interface PhosphorIconPickerContentProps {
  value?: string;
  onChange: (value: string) => void;
}

interface CategoryOption {
  label: string;
  value: string;
}

const ALL_CATEGORY_VALUE = '__all__';
const ICON_GRID_COLUMNS = 4;
const ICON_LIST_INITIAL_RENDER_COUNT = 32;
const ICON_LIST_MAX_RENDER_BATCH = 32;
const ICON_LIST_WINDOW_SIZE = 7;

const CATEGORY_OPTIONS: readonly CategoryOption[] = [
  { label: '全部', value: ALL_CATEGORY_VALUE },
  ...Array.from(
    new Set(PHOSPHOR_ICON_OPTIONS.map(info => info.primaryCategoryLabel)),
  ).map(label => ({ label, value: label })),
];

const useStyles = createUseSheetStyle(token => ({
  body: {
    flex: 1,
  },
  categoryItem: {
    alignItems: 'center',
    borderColor: token.colorBorder,
    borderRadius: token.borderRadius,
    borderWidth: token.lineWidth,
    justifyContent: 'center',
    marginRight: token.marginXS,
    minHeight: token.controlHeight,
    paddingHorizontal: token.paddingSM,
  },
  categoryItemActive: {
    backgroundColor: token.colorPrimaryBg,
    borderColor: token.colorPrimary,
  },
  categoryList: {
    flexGrow: 0,
  },
  empty: {
    padding: token.padding,
  },
  grid: {
    flex: 1,
  },
  gridContent: {
    paddingBottom: token.padding,
  },
  gridRow: {
    gap: token.marginXS,
  },
  iconCell: {
    alignItems: 'center',
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorBorder,
    borderRadius: token.borderRadius,
    borderWidth: token.lineWidth,
    flex: 1,
    gap: token.marginXXS,
    height: token.controlHeightLG + token.controlHeight,
    justifyContent: 'center',
    marginBottom: token.marginXS,
    paddingHorizontal: token.paddingXS,
  },
  iconCellActive: {
    backgroundColor: token.colorPrimaryBg,
    borderColor: token.colorPrimary,
  },
  panelBody: {
    flex: 1,
    paddingHorizontal: token.padding,
  },
}));

function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase();
}

function matchesSearch(info: PhosphorIconOption, searchText: string): boolean {
  if (searchText.length === 0) {
    return true;
  }

  return [
    info.pascalName,
    ...info.categories,
    ...info.tags,
    ...info.categoriesZh,
    ...info.tagsZh,
  ].some(value => value.toLowerCase().includes(searchText));
}

function matchesCategory(info: PhosphorIconOption, category: string): boolean {
  return (
    category === ALL_CATEGORY_VALUE ||
    info.primaryCategoryLabel === category
  );
}

export function PhosphorIconPickerContent({
  onChange,
  value,
}: PhosphorIconPickerContentProps) {
  const [searchText, setSearchText] = useState('');
  const [category, setCategory] = useState(ALL_CATEGORY_VALUE);
  const styles = useStyles();

  const filteredIcons = useMemo(() => {
    const normalizedSearchText = normalizeSearchText(searchText);

    return PHOSPHOR_ICON_OPTIONS.filter(info => (
      matchesCategory(info, category) &&
      matchesSearch(info, normalizedSearchText)
    ));
  }, [category, searchText]);

  function renderCategory({ item }: { item: CategoryOption }) {
    const isActive = item.value === category;

    return (
      <Pressable
        onPress={() => setCategory(item.value)}
        style={[
          styles.categoryItem,
          isActive ? styles.categoryItemActive : null,
        ]}
      >
        <Text color={isActive ? 'primary' : 'secondary'} size="sm">
          {item.label}
        </Text>
      </Pressable>
    );
  }

  function renderIcon({ item }: { item: PhosphorIconOption }) {
    const isActive = item.pascalName === value;

    return (
      <Pressable
        onPress={() => onChange(item.pascalName)}
        style={[
          styles.iconCell,
          isActive ? styles.iconCellActive : null,
        ]}
      >
        <Icon
          color={isActive ? 'primary' : 'text'}
          icon={getPhosphorIconComponent(item.pascalName)}
          size="large"
          weight="duotone"
        />
        <Text
          color={isActive ? 'primary' : 'secondary'}
          size="sm"
          textAlign="center"
        >
          {item.label}
        </Text>
      </Pressable>
    );
  }

  return (
    <Column style={styles.body} gap="normal">
      <Input.Search
        labelText="搜索"
        allowClear
        placeholder="图标名称"
        value={searchText}
        onChange={setSearchText}
      />
      <List
        data={CATEGORY_OPTIONS}
        horizontal
        keyExtractor={item => item.value}
        renderItem={renderCategory}
        scrollEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.categoryList}
      />
      <List
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.gridContent}
        data={filteredIcons}
        initialNumToRender={ICON_LIST_INITIAL_RENDER_COUNT}
        keyExtractor={item => item.pascalName}
        maxToRenderPerBatch={ICON_LIST_MAX_RENDER_BATCH}
        numColumns={ICON_GRID_COLUMNS}
        renderItem={renderIcon}
        scrollEnabled
        style={styles.grid}
        windowSize={ICON_LIST_WINDOW_SIZE}
        empty={(
          <Row style={styles.empty} align="center" justify="center">
            <Text color="tertiary">暂无匹配图标</Text>
          </Row>
        )}
      />
    </Column>
  );
}

export function PhosphorIconPicker({
  open,
  onChange,
  onOpenChange,
  titleText = '选择图标',
  value,
}: PhosphorIconPickerProps) {
  const styles = useStyles();

  function handleChange(nextValue: string): void {
    onChange(nextValue);
    onOpenChange(false);
  }

  return (
    <Popup.FloatingPanel
      bodyScrollable={false}
      footer={null}
      height="80%"
      keyboardAvoiding
      onOpenChange={onOpenChange}
      open={open}
      position="bottom"
      titleText={titleText}
      styles={{ panelBody: styles.panelBody }}
    >
      <PhosphorIconPickerContent value={value} onChange={handleChange} />
    </Popup.FloatingPanel>
  );
}
