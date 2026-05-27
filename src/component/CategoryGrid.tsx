import React, { useCallback, useMemo } from 'react';
import { Pressable, StyleProp, ViewStyle } from 'react-native';
import {
  Grid,
  Column,
  Text,
  Icon,
  ListCollapse,
  type GridProps,
  type IconComponent,
} from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { chunk, isNil } from 'es-toolkit';
import { TypeRow } from '@pennyspring/data';
import { ICON_MAP } from '../constants/typeIconTree.ts';
import { useControllableValue } from '../../packages/pennyspring-ui/src/_hooks';

export interface CategoryItem extends Omit<TypeRow, 'icon'> {
  icon: TypeRow['icon'] | IconComponent;
  expand?: boolean;
}

interface CategoryGridProps {
  categories: CategoryItem[];
  onSelect?: (id: number) => void;
  value?: number;
  onChange?: (id?: number) => void;
  defaultValue?: number;
  style?: StyleProp<ViewStyle>;
}

const useStyles = createUseSheetStyle(_token => ({
  subcategoryContainer: { paddingHorizontal: 0 },
  header: { paddingHorizontal: 0 },
}));

export function CategoryGrid(props: CategoryGridProps) {
  const { categories, style } = props;
  const [value, onChange] = useControllableValue(props.defaultValue, props.value, props.onChange)
  const onSelect = useCallback((v: number) => {
    onChange?.(v)
    if (!isNil(v)) {
      props.onSelect?.(v);
    }
  }, [onChange, props.onSelect]);
  const styles = useStyles();
  const tree = useMemo(() => {
    const parents = categories.filter(t => t.parentId === 0);
    return [
      ...parents.map(p => ({
        ...p,
        children: [...categories.filter(t => t.parentId === p.id)],
      })),
    ];
  }, [categories]);

  const findExpandedCategory = (id?: number) => {
    if (isNil(id)) return null;
    const primary = tree.find(cat => cat.id === id);
    if (primary) return primary;
    for (const cat of tree) {
      if (cat.children?.some(child => child.id === id)) {
        return cat;
      }
    }
    return null;
  };

  const { token } = useTheme();
  return (
    <Column style={[{ borderRadius: token.borderRadius, overflow: 'hidden' },style]}>
      {chunk(tree, 5).map(list => {
        const allIds = list
          .map(v => (v.children ?? []).map(child => child.id).concat([v.id]))
          .flat(1);
        const expandedCat = findExpandedCategory(value);
        return (
          <ListCollapse
            key={list[0].id}
            expanded={allIds.includes(value!)}
            title={<Cells list={list} onSelect={onSelect} value={value} />}
            styles={{
              header: styles.header,
              content: [styles.subcategoryContainer],
            }}
          >
            {expandedCat?.expand !== false && expandedCat?.children && (
              <Cells
                list={expandedCat?.children}
                onSelect={onSelect}
                value={value}
              />
            )}
          </ListCollapse>
        );
      })}
    </Column>
  );
}

interface CellsProps extends Pick<CategoryGridProps, 'value'> {
  list: CategoryItem[];
  onSelect: (id: number) => void;
  style?: GridProps['style'];
}

function Cells({ list, onSelect, value, style }: CellsProps) {
  return (
    <Grid columns={5} gap="small" style={[{ flex: 1 }, style]}>
      {list.map(item => (
        <Grid.Item key={item.id}>
          <Cell
            item={item}
            onSelect={onSelect}
            isSelected={value === item.id}
          />
        </Grid.Item>
      ))}
    </Grid>
  );
}

interface CellProps {
  item: CategoryItem;
  onSelect: (id: number) => void;
  isSelected: boolean;
}

function Cell({ item, onSelect, isSelected }: CellProps) {
  const { token } = useTheme();
  const iconValue =
    typeof item.icon === 'string' ? ICON_MAP[item.icon] : item.icon;
  return (
    <Pressable onPress={() => onSelect(item.id)}>
      <Column align="center" gap={token.marginXXS}>
        <Icon
          icon={iconValue}
          color={isSelected ? 'primary' : 'text'}
          size="large"
          weight="duotone"
        />
        <Text
          size="sm"
          style={{ color: isSelected ? token.colorPrimary : token.colorText }}
        >
          {item.name}
        </Text>
      </Column>
    </Pressable>
  );
}
