import React from 'react';
import { Pressable } from 'react-native';
import {
  Grid,
  Column,
  Text,
  Icon,
  ListCollapse,
  type GridProps,
  type IconName,
  type IconComponent,
} from '@pennyspring/component';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { chunk } from 'es-toolkit';

export interface CategoryItem {
  id: number;
  name: string;
  icon: IconName | IconComponent;
  children?: CategoryItem[];
}

interface CategoryGridProps {
  categories: CategoryItem[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

const useStyles = createUseSheetStyle(_token => ({
  subcategoryContainer: { paddingHorizontal: 0 },
  header: { paddingHorizontal: 0 },
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

  return (
    <Column>
      {chunk(categories, 5).map(list => {
        const allIds = list
          .map(v => (v.children ?? []).map(child => child.id).concat([v.id]))
          .flat(1);
        const expandedCat = findExpandedCategory(selectedId);
        const children = expandedCat?.children;
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
            styles={{ header: styles.header, content: styles.subcategoryContainer }}
          >
            {children && (
              <Cells
                list={children}
                onSelect={onSelect}
                selectedId={selectedId}
              />
            )}
          </ListCollapse>
        );
      })}
    </Column>
  );
}

interface CellsProps extends Pick<CategoryGridProps, 'selectedId'> {
  list: CategoryItem[];
  onSelect: (id: number) => void;
  style?: GridProps['style'];
}

function Cells({ list, onSelect, selectedId, style }: CellsProps) {
  return (
    <Grid columns={5} gap="small" style={[{ flex: 1 }, style]}>
      {list.map(item => (
        <Grid.Item key={item.id}>
          <Cell
            item={item}
            onSelect={onSelect}
            isSelected={selectedId === item.id}
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
  return (
    <Pressable onPress={() => onSelect(item.id)}>
      <Column align="center" gap={token.marginXXS}>
        <Icon
          icon={item.icon}
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
