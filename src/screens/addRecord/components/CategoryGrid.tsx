import React from 'react';
import { Pressable, View } from 'react-native';
import { Grid, Column, Row, Tag, Text } from '@pennyspring/component';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';

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

const useStyles = createUseSheetStyle((token) => ({
  iconCircle: {
    width: token.controlHeightLG,
    height: token.controlHeightLG,
    borderRadius: token.borderRadiusLG,
    backgroundColor: token.colorFillTertiary,
  },
  iconCircleSelected: {
    backgroundColor: token.colorPrimaryBg,
  },
  subcategoryContainer: {
    marginTop: token.marginMD,
  },
}));

export function CategoryGrid(props: CategoryGridProps) {
  const { categories, selectedId, onSelect } = props;
  const styles = useStyles();
  const { token } = useTheme();

  const findExpandedCategory = () => {
    if (selectedId === null) return null;

    const primary = categories.find(cat => cat.id === selectedId);
    if (primary) return primary;

    for (const cat of categories) {
      if (cat.children?.some(child => child.id === selectedId)) {
        return cat;
      }
    }
    return null;
  };

  const expandedCategory = findExpandedCategory();

  return (
    <>
      <Grid columns={5} gap="small">
        {categories.map(item => {
          const isSelected = expandedCategory?.id === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => onSelect(item.id)}
              data-id={item.id}
            >
              <Column align="center" gap={token.marginXXS}>
                <View style={[styles.iconCircle, isSelected && styles.iconCircleSelected]} />
                <Text size="sm">{item.name}</Text>
              </Column>
            </Pressable>
          );
        })}
      </Grid>
      {expandedCategory?.children && expandedCategory.children.length > 0 && (
        <View style={styles.subcategoryContainer} testID="subcategory-row">
          <Row wrap gap={token.marginXS}>
            {expandedCategory.children.map(child => (
              <Tag key={child.id} onPress={() => onSelect(child.id)}>
                {child.name}
              </Tag>
            ))}
          </Row>
        </View>
      )}
    </>
  );
}
