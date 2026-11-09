import React, { useEffect, useMemo, useState } from 'react';
import { Pressable } from 'react-native';
import { Column, Empty, Popup, Row, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';
import {
  RECORD_TYPE_CATEGORY,
  type RecordTypeCategoryValue,
  type TypeRow,
} from '@pennyspring/api';

import {
  CategoryGrid,
  type CategoryItem,
} from '../../../../component/CategoryGrid';

const CATEGORY_OPTIONS: ReadonlyArray<{
  value: RecordTypeCategoryValue;
  labelText: string;
}> = [
  { value: RECORD_TYPE_CATEGORY.expense, labelText: '支出' },
  { value: RECORD_TYPE_CATEGORY.income, labelText: '收入' },
  { value: RECORD_TYPE_CATEGORY.transfer, labelText: '转账' },
];

const useStyles = createUseSheetStyle(token => ({
  body: {
    gap: token.marginSM,
  },
  tabs: {
    borderBottomColor: token.colorSplit,
    borderBottomWidth: token.lineWidth,
    flexDirection: 'row',
  },
  tab: {
    alignItems: 'center',
    borderBottomColor: 'transparent',
    borderBottomWidth: token.lineWidth * 2,
    flex: 1,
    height: token.controlHeight,
    justifyContent: 'center',
  },
  tabActive: {
    borderBottomColor: token.colorPrimary,
  },
  empty: {
    paddingVertical: token.paddingLG,
  },
}));

interface DraftTypePickerProps {
  open: boolean;
  types: readonly TypeRow[];
  value: number;
  onCancel: () => void;
  onSelect: (type: TypeRow) => void;
}

export function DraftTypePicker({
  open,
  types,
  value,
  onCancel,
  onSelect,
}: DraftTypePickerProps): React.ReactElement {
  const styles = useStyles();
  const currentType = useMemo(
    () => types.find(type => type.id === value),
    [types, value],
  );
  const [category, setCategory] = useState<RecordTypeCategoryValue>(
    currentType?.typeCategory ?? RECORD_TYPE_CATEGORY.expense,
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    setCategory(currentType?.typeCategory ?? RECORD_TYPE_CATEGORY.expense);
  }, [currentType, open]);

  const categories = useMemo(
    () =>
      types.filter(type => type.typeCategory === category) as CategoryItem[],
    [category, types],
  );

  function handleChange(id?: number): void {
    if (id === undefined) {
      return;
    }
    const type = types.find(item => item.id === id);
    if (type === undefined) {
      return;
    }
    onSelect(type);
    const hasChildren = types.some(item => item.parentId === id);
    if (!hasChildren) {
      onCancel();
    }
  }

  return (
    <Popup.FloatingPanel
      bodyScrollable
      closeOnMaskClick
      footer={null}
      height="72%"
      onCancel={onCancel}
      onOpenChange={nextOpen => {
        if (!nextOpen) {
          onCancel();
        }
      }}
      open={open}
      scrollEnabled
      titleText="选择类型"
    >
      <Column style={styles.body}>
        <Row style={styles.tabs}>
          {CATEGORY_OPTIONS.map(option => {
            const isActive = option.value === category;
            return (
              <Pressable
                key={option.value}
                onPress={() => setCategory(option.value)}
                style={[styles.tab, isActive ? styles.tabActive : null]}
              >
                <Text
                  color={isActive ? 'primary' : 'tertiary'}
                  size="sm"
                  weight={isActive ? 'semibold' : 'regular'}
                >
                  {option.labelText}
                </Text>
              </Pressable>
            );
          })}
        </Row>
        {categories.length > 0 ? (
          <CategoryGrid
            categories={categories}
            onChange={handleChange}
            value={value > 0 ? value : undefined}
          />
        ) : (
          <Empty
            descriptionText="暂无可选类型，请先在类型管理中添加。"
            size="small"
            style={styles.empty}
            titleText="暂无类型"
          />
        )}
      </Column>
    </Popup.FloatingPanel>
  );
}
