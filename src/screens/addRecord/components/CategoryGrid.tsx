import React from 'react';
import { Pressable } from 'react-native';
import {
  Grid,
  Column,
  Text,
  Icon,
  ListCollapse,
  GridProps,
} from '@pennyspring/component';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { ICON_MAP } from '../../../constants/typeIconTree.ts';
import { chunk } from 'es-toolkit';

export interface CategoryItem {
  id: number;
  name: string;
  icon: string;
  children?: CategoryItem[];
}

interface CategoryGridProps {
  categories: CategoryItem[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

const useStyles = createUseSheetStyle(_token => ({
  subcategoryContainer: {
    paddingHorizontal: 0,
  },
  header: {
    paddingHorizontal: 0,
  },
}));

export function CategoryGrid(props: CategoryGridProps) {
  const { categories, selectedId, onSelect } = props;
  const styles = useStyles();
  const findExpandedCategory = (id: number | null) => {
    if (id === null) return null;

    const primary = categories.find(cat => cat.id === id);
    if (primary) return primary;

    for (const cat of categories) {
      if (cat.children?.some(child => child.id === id)) {
        return cat;
      }
    }
    return null;
  };

  const firstCategory = categories.filter(v => v.children?.length);
  return (
    <>
      <Column>
        {chunk(firstCategory, 5).map(list => {
          const allIds = list
            .map(v => (v.children ?? []).map(child => child.id).concat([v.id]))
            .flat(1);
          const children = findExpandedCategory(selectedId)?.children;
          return (
            <ListCollapse
              key={list[0].id}
              expanded={allIds.includes(selectedId!)}
              title={
                <Cells
                  list={list}
                  onSelect={onSelect}
                  selectedId={selectedId}
                />
              }
              styles={{
                header: styles.header,
                content: styles.subcategoryContainer,
              }}
            >
              {children && (
                <Cells
                  key={list[0].id}
                  list={children}
                  onSelect={onSelect}
                  selectedId={selectedId}
                />
              )}
            </ListCollapse>
          );
        })}
      </Column>
    </>
  );
}

interface CellsProps
  extends Pick<CategoryGridProps, 'onSelect' | 'selectedId'> {
  list: CategoryItem[];
  style?: GridProps['style'];
}

function Cells({ list, onSelect, selectedId, style }: CellsProps) {
  return (
    <Grid columns={5} gap="small" style={style}>
      {list.map(item => (
        <Grid.Item>
          <Cell
            key={item.id}
            item={item}
            onSelect={onSelect}
            isSelected={selectedId === item.id}
          />
        </Grid.Item>
      ))}
    </Grid>
  );
}

interface CellProps extends Pick<CategoryGridProps, 'onSelect'> {
  item: CategoryItem;
  isSelected: boolean;
}

function Cell({ item, onSelect, isSelected }: CellProps) {
  const { token } = useTheme();
  const IconComponent = ICON_MAP[item.icon];
  return (
    <Pressable
      key={item.id}
      onPress={() => onSelect(item.id)}
      data-id={item.id}
    >
      <Column align="center" gap={token.marginXXS}>
        <Icon
          icon={IconComponent}
          color={isSelected ? 'colorPrimary' : 'colorText'}
          size={24}
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
