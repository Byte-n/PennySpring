import React, { useCallback, useMemo } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import {
  Grid,
  Column,
  Empty,
  Text,
  Icon,
  Row,
  type GridProps,
  type IconComponent,
} from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { chunk, isNil } from 'es-toolkit';
import { TypeRow } from '@pennyspring/api';
import { getPhosphorIconComponent } from '../constants/typeIconTree.ts';
import { useControllableValue } from '@pennyspring/ui/src/_hooks';

const MORE_BUTTON_HIT_SLOP = 6;

export interface CategoryItem extends Omit<TypeRow, 'icon'> {
  icon: TypeRow['icon'] | IconComponent;
  expand?: boolean;
}

type CategoryTreeNode = CategoryItem & { children: CategoryItem[] };

interface CategoryGridProps {
  categories: CategoryItem[];
  onSelect?: (id: number) => void;
  onItemLongPress?: (id: number) => void;
  value?: number;
  onChange?: (id?: number) => void;
  defaultValue?: number;
  style?: StyleProp<ViewStyle>;
  accordion?: boolean;
  /** 管理页变体：展开区带「⋯」、二级末尾带虚线「＋ 新增」。 */
  manage?: boolean;
  /** 管理页当前展开的一级类型。 */
  expandedId?: number;
  onExpandedChange?: (id?: number) => void;
  onMorePress?: (parentId: number) => void;
  onAddChild?: (parentId: number) => void;
  onChildPress?: (childId: number) => void;
}

const useStyles = createUseSheetStyle(token => ({
  root: { borderRadius: token.borderRadius, overflow: 'hidden' },
  rootManage: {
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorSplit,
    borderWidth: token.lineWidth,
  },
  groupHeader: {
    paddingHorizontal: token.paddingXS,
    paddingVertical: token.paddingXS,
  },
  groupDivider: {
    borderTopColor: token.colorSplit,
    borderTopWidth: token.lineWidth,
  },
  cells: { flex: 1 },
  cell: {
    alignItems: 'center',
    borderRadius: token.borderRadius,
    gap: token.marginXXS,
    justifyContent: 'center',
    minHeight: token.controlHeightLG,
    paddingHorizontal: token.paddingXXS,
    paddingVertical: token.paddingXXS,
  },
  cellSmall: {
    gap: token.marginXXS / 2,
    minHeight: token.controlHeightLG,
    paddingVertical: token.paddingXXS,
  },
  cellSelected: {
    backgroundColor: token.colorPrimaryBg,
  },
  cellPressed: {
    backgroundColor: token.colorFillQuaternary,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  expansion: {
    backgroundColor: token.colorFillQuaternary,
    borderTopColor: token.colorSplit,
    borderTopWidth: token.lineWidth,
    paddingHorizontal: token.paddingXXS,
    paddingBottom: token.paddingXS,
  },
  expansionHeader: {
    alignItems: 'center',
    height: token.controlHeightSM,
    justifyContent: 'space-between',
    paddingHorizontal: token.paddingXS,
  },
  expansionMeta: {
    color: token.colorTextTertiary,
    flex: 1,
  },
  moreButton: {
    alignItems: 'center',
    borderRadius: token.borderRadiusSM,
    height: token.controlHeightSM,
    justifyContent: 'center',
    width: token.controlHeightSM,
  },
  moreButtonPressed: {
    backgroundColor: token.colorFill,
  },
  addCell: {
    alignItems: 'center',
    borderColor: token.colorBorder,
    borderRadius: token.borderRadius,
    borderStyle: 'dashed',
    borderWidth: token.lineWidth,
    gap: token.marginXXS,
    justifyContent: 'center',
    minHeight: token.controlHeightLG,
    paddingHorizontal: token.paddingXXS,
  },
  addCellPressed: {
    backgroundColor: token.colorFillQuaternary,
  },
}));

export function CategoryGrid(props: CategoryGridProps) {
  const {
    accordion = true,
    categories,
    expandedId,
    manage = false,
    onAddChild,
    onChildPress,
    onExpandedChange,
    onItemLongPress,
    onMorePress,
    style,
  } = props;
  const [value, onChange] = useControllableValue(
    props.defaultValue,
    props.value,
    props.onChange,
  );
  const [expandedIds, setExpandedIds] = React.useState<Set<number>>(new Set());
  const onSelect = useCallback(
    (v: number) => {
      onChange?.(v);
      if (!isNil(v)) {
        props.onSelect?.(v);
      }
    },
    [onChange, props.onSelect],
  );
  const styles = useStyles();
  const tree = useMemo<CategoryTreeNode[]>(() => {
    const parents = categories.filter(t => t.parentId === 0);
    return parents.map(p => ({
      ...p,
      children: categories.filter(t => t.parentId === p.id),
    }));
  }, [categories]);

  const activeExpandedIds = useMemo(() => {
    if (!manage) {
      return expandedIds;
    }
    return new Set<number>(expandedId === undefined ? [] : [expandedId]);
  }, [expandedId, expandedIds, manage]);

  const handlePrimarySelect = useCallback(
    (catId: number) => {
      if (manage) {
        onExpandedChange?.(expandedId === catId ? undefined : catId);
        return;
      }

      onSelect(catId);
      setExpandedIds(prev => {
        const next = new Set(prev);
        if (next.has(catId)) {
          next.delete(catId);
        } else {
          if (accordion) next.clear();
          next.add(catId);
        }
        return next;
      });
    },
    [accordion, expandedId, manage, onExpandedChange, onSelect],
  );

  const getExpandedCat = (id?: number) => {
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

  return (
    <Column style={[styles.root, manage && styles.rootManage, style]}>
      {chunk(tree, 5).map((list, rowIndex) => {
        const expandedCatInList = list.find(cat =>
          activeExpandedIds.has(cat.id),
        );
        const isOpen = expandedCatInList !== undefined;
        const expandedCat = manage
          ? expandedCatInList
          : (expandedCatInList ?? getExpandedCat(value));
        return (
          <Column
            key={list[0].id}
            style={rowIndex > 0 ? styles.groupDivider : undefined}
          >
            <Column style={styles.groupHeader}>
              <Cells
                expandedIds={activeExpandedIds}
                list={list}
                onItemLongPress={onItemLongPress}
                onPrimarySelect={handlePrimarySelect}
                onSelect={onSelect}
                value={value}
              />
            </Column>
            {isOpen && expandedCat && expandedCat.expand !== false ? (
              manage ? (
                <ManageExpansion
                  onAddChild={onAddChild}
                  onChildPress={onChildPress}
                  onMorePress={onMorePress}
                  parent={expandedCat}
                />
              ) : expandedCat.children.length > 0 ? (
                <Cells
                  list={expandedCat.children}
                  onItemLongPress={onItemLongPress}
                  onSelect={onSelect}
                  parentId={expandedCat.id}
                  value={value}
                />
              ) : (
                <Empty descriptionText="暂无二级类型" size="small" />
              )
            ) : null}
          </Column>
        );
      })}
    </Column>
  );
}

interface CellsProps extends Pick<CategoryGridProps, 'value'> {
  list: CategoryItem[];
  onSelect: (id: number) => void;
  style?: GridProps['style'];
  onPrimarySelect?: (id: number) => void;
  expandedIds?: Set<number>;
  parentId?: number;
  onItemLongPress?: (id: number) => void;
}

function Cells({
  list,
  onSelect,
  value,
  style,
  onPrimarySelect,
  expandedIds,
  parentId,
  onItemLongPress,
}: CellsProps) {
  const styles = useStyles();

  const handleSecondarySelect = useCallback(
    (childId: number) => {
      if (value === childId) {
        onSelect(parentId!);
      } else {
        onSelect(childId);
      }
    },
    [value, onSelect, parentId],
  );

  return (
    <Grid columns={5} style={[styles.cells, style]}>
      {list.map(item => (
        <Grid.Item key={item.id}>
          <Cell
            isSelected={value === item.id || (expandedIds?.has(item.id) ?? false)}
            item={item}
            onLongPress={
              onItemLongPress ? () => onItemLongPress(item.id) : undefined
            }
            onPress={
              onPrimarySelect
                ? () => onPrimarySelect(item.id)
                : () => handleSecondarySelect(item.id)
            }
          />
        </Grid.Item>
      ))}
    </Grid>
  );
}

interface ManageExpansionProps {
  parent: CategoryTreeNode;
  onMorePress?: (parentId: number) => void;
  onAddChild?: (parentId: number) => void;
  onChildPress?: (childId: number) => void;
}

function ManageExpansion({
  parent,
  onMorePress,
  onAddChild,
  onChildPress,
}: ManageExpansionProps) {
  const styles = useStyles();
  const meta = [
    `${parent.children.length} 个二级类型`,
    parent.isSystem === 'system' ? '系统' : '',
    parent.specialBehavior ? '联动' : '',
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Column style={styles.expansion}>
      <Row style={styles.expansionHeader}>
        <Text size="xs" style={styles.expansionMeta}>
          {meta}
        </Text>
        {onMorePress ? (
          <Pressable
            hitSlop={MORE_BUTTON_HIT_SLOP}
            onPress={() => onMorePress(parent.id)}
            style={({ pressed }) => [
              styles.moreButton,
              pressed && styles.moreButtonPressed,
            ]}
            testID="category-grid-more"
          >
            <Icon color="tertiary" icon="more" size="large" />
          </Pressable>
        ) : null}
      </Row>
      <Grid columns={5} style={styles.cells}>
        {parent.children.map(child => (
          <Grid.Item key={child.id}>
            <Cell
              isSelected={false}
              item={child}
              onPress={() => onChildPress?.(child.id)}
              small
            />
          </Grid.Item>
        ))}
        {onAddChild ? (
          <Grid.Item>
            <AddCell onPress={() => onAddChild(parent.id)} />
          </Grid.Item>
        ) : null}
      </Grid>
    </Column>
  );
}

function AddCell({ onPress }: { onPress: () => void }) {
  const styles = useStyles();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.addCell,
        pressed && styles.addCellPressed,
      ]}
      testID="category-grid-add-child"
    >
      <Icon color="primary" icon="plus" size="normal" />
      <Text color="primary" size="xs">
        新增
      </Text>
    </Pressable>
  );
}

interface CellProps {
  item: CategoryItem;
  onPress: () => void;
  onLongPress?: () => void;
  isSelected: boolean;
  small?: boolean;
}

function Cell({
  item,
  onPress,
  onLongPress,
  isSelected,
  small = false,
}: CellProps) {
  const { token } = useTheme();
  const styles = useStyles();
  const iconValue =
    typeof item.icon === 'string'
      ? getPhosphorIconComponent(item.icon)
      : item.icon;
  const IconComponent = iconValue;
  const iconColor = isSelected ? token.colorPrimary : token.colorTextSecondary;

  return (
    <Pressable
      onLongPress={onLongPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.cell,
        small && styles.cellSmall,
        isSelected && styles.cellSelected,
        pressed && styles.cellPressed,
      ]}
    >
      <Column align="center" style={styles.iconWrap}>
        <IconComponent
          color={iconColor}
          size={
            small ? token.fontSizeHeading4 : token.fontSizeHeading2
          }
          weight="duotone"
        />
      </Column>
      <Text
        color={isSelected ? 'primary' : small ? 'secondary' : 'default'}
        numberOfLines={1}
        size="xs"
        weight={isSelected ? 'semibold' : small ? 'regular' : 'medium'}
      >
        {item.name}
      </Text>
    </Pressable>
  );
}
