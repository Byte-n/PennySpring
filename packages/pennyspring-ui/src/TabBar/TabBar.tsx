import type { ComponentSize } from '../shares/types';
import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { Column } from '../Column';
import { Row } from '../Row';
import { Badge } from '../Badge';
import { Text } from '../Text';
import { useControllableValue } from '../_hooks';
import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { TextColor, TextSize, TextWeight } from '../Text/types';
import type { TabBarItem, TabBarProps, TabBarValue } from './types';
import { useStyles } from './style';

const SIZE_TEXT_SIZE_MAP: Record<ComponentSize, TextSize> = {
  small: 'sm',
  normal: 'sm',
  large: 'md',
};

function getTitleColor(
  isSelected: boolean,
  itemDisabled: boolean,
): TextColor {
  if (itemDisabled) {
    return 'disabled';
  }

  if (isSelected) {
    return 'primary';
  }

  return 'secondary';
}

function getTitleWeight(isSelected: boolean): TextWeight {
  return isSelected ? 'strong' : 'regular';
}

function getInitialValue(
  items: TabBarItem[],
  defaultValue?: TabBarValue,
): TabBarValue | undefined {
  if (defaultValue !== undefined) {
    return defaultValue;
  }

  return items.find(item => !item.disabled)?.key;
}

function renderTitle(
  title: ReactNode,
  textSize: TextSize,
  weight: TextWeight,
  color: TextColor,
  style: StyleProp<TextStyle>,
) {
  if (title == null || title === false) {
    return null;
  }

  if (typeof title === 'string' || typeof title === 'number') {
    return (
      <Text
        color={color}
        size={textSize}
        weight={weight}
        style={style}
      >
        {title}
      </Text>
    );
  }

  return title;
}

function renderBadge(
  badge: ReactNode,
  badgeStyle: StyleProp<ViewStyle>,
) {
  if (badge == null || badge === false) {
    return null;
  }

  if (typeof badge === 'string' || typeof badge === 'number') {
    return (
      <Badge count={badge} style={badgeStyle} />
    );
  }

  return badge;
}

export function TabBar({
  items,
  value,
  defaultValue,
  onChange,
  disabled = false,
  size = 'normal',
  safeAreaInsetBottom = true,
  style,
  styles,
  onPress,
  ...rest
}: TabBarProps) {
  const tokenStyles = useStyles({ disabled, safeAreaInsetBottom, size });
  const normalizedItems = useMemo(() => [...items], [items]);
  const [selectedValue, setSelectedValue] = useControllableValue(
    getInitialValue(normalizedItems, defaultValue),
    value,
    onChange,
  );
  const textSize = SIZE_TEXT_SIZE_MAP[size];

  return (
    <Row align="stretch" testID="tab-bar-root" style={[tokenStyles.root, style]}>
      <Row align="stretch" style={styles?.tabList}>
        {normalizedItems.map(item => {
          const itemDisabled = disabled || item.disabled === true;
          const isSelected = selectedValue === item.key;
          const titleNode = item.title !== undefined ? item.title : item.titleText;
          const iconNode =
            isSelected && item.activeIcon !== undefined ? item.activeIcon : item.icon;
          const badgeNode = item.badge !== undefined ? item.badge : item.badgeText;
          const titleColor = getTitleColor(isSelected, itemDisabled);
          const titleWeight = getTitleWeight(isSelected);

          return (
            <Pressable
              {...rest}
              key={String(item.key)}
              testID={`tab-bar-item-${String(item.key)}`}
              disabled={itemDisabled}
              hitSlop={tokenStyles.hitSlop}
              onPress={event => {
                if (itemDisabled || isSelected) {
                  return;
                }

                onPress?.(event, item.key);
                setSelectedValue(item.key);
              }}
              style={({ pressed }) => [
                tokenStyles.tab,
                styles?.tab,
                isSelected ? tokenStyles.tabActive : null,
                isSelected ? styles?.tabActive : null,
                pressed && !itemDisabled ? tokenStyles.tabPressed : null,
                pressed && !itemDisabled ? styles?.tabPressed : null,
                itemDisabled ? tokenStyles.tabDisabled : null,
                itemDisabled ? styles?.tabDisabled : null,
              ]}
            >
              <Column align="center">
                {iconNode === undefined ? null : (
                  <View testID="icon-container" style={[tokenStyles.iconContainer, styles?.icon]}>{iconNode}</View>
                )}
                {renderTitle(
                  titleNode,
                  textSize,
                  titleWeight,
                  titleColor,
                  [
                    styles?.titleText,
                    isSelected ? styles?.titleTextActive : null,
                    itemDisabled ? styles?.titleTextDisabled : null,
                  ],
                )}
                {renderBadge(
                  badgeNode,
                  [tokenStyles.badge, styles?.badge],
                )}
              </Column>
            </Pressable>
          );
        })}
      </Row>
    </Row>
  );
}
