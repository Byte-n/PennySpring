import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { Column } from '../Column';
import { Row } from '../Row';
import { Text } from '../Text';
import { renderTextNode } from '../shares/node';
import { useControllableValue } from '../_hooks';
import type { ReactNode } from 'react';
import type { StyleProp, TextStyle } from 'react-native';
import type { TextColor, TextWeight } from '../Text/types';
import type { TabBarItem, TabBarProps, TabBarValue } from './types';
import { useStyles } from './style';

const BADGE_OVERFLOW_COUNT = 99;

function getTitleColor(isSelected: boolean, itemDisabled: boolean): TextColor {
  if (itemDisabled) {
    return 'quaternary';
  }

  if (isSelected) {
    return 'primary';
  }

  return 'tertiary';
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

  return items.find(item => !item.disabled)?.value;
}

function renderTitle(
  title: ReactNode,
  weight: TextWeight,
  color: TextColor,
  style: StyleProp<TextStyle>,
) {
  if (title == null || title === false) {
    return null;
  }

  if (typeof title === 'string' || typeof title === 'number') {
    return (
      <Text color={color} size="xs" style={style} weight={weight}>
        {title}
      </Text>
    );
  }

  return title;
}

function isPrimitiveBadge(badge: ReactNode): badge is string | number {
  return typeof badge === 'string' || typeof badge === 'number';
}

function formatBadgeText(badge: string | number): string {
  const count = Number(badge);

  return Number.isFinite(count) && count > BADGE_OVERFLOW_COUNT
    ? `${BADGE_OVERFLOW_COUNT}+`
    : String(badge);
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

  return (
    <Row
      align="stretch"
      testID="tab-bar-root"
      style={[tokenStyles.root, style]}
    >
      <Row align="stretch" style={[tokenStyles.tabList, styles?.tabList]}>
        {normalizedItems.map(item => {
          const itemDisabled = disabled || item.disabled === true;
          const isSelected = selectedValue === item.value;
          const titleNode =
            item.title !== undefined ? item.title : item.titleText;
          const iconNode =
            isSelected && item.activeIcon !== undefined
              ? item.activeIcon
              : item.icon;
          const badgeNode =
            item.badge !== undefined ? item.badge : item.badgeText;
          const titleColor = getTitleColor(isSelected, itemDisabled);
          const titleWeight = getTitleWeight(isSelected);
          const hasBadge = badgeNode != null && badgeNode !== false;
          const isDotBadge = hasBadge && !isPrimitiveBadge(badgeNode);

          return (
            <Pressable
              {...rest}
              key={String(item.value)}
              testID={`tab-bar-item-${String(item.value)}`}
              disabled={itemDisabled}
              onPress={event => {
                if (itemDisabled || isSelected) {
                  return;
                }

                onPress?.(event, item.value);
                setSelectedValue(item.value);
              }}
              style={[
                tokenStyles.tab,
                styles?.tab,
                isSelected ? styles?.tabActive : null,
                itemDisabled ? styles?.tabDisabled : null,
              ]}
            >
              {({ pressed }) => (
                <>
                  <View
                    style={[
                      tokenStyles.pressSurface,
                      pressed && !itemDisabled ? tokenStyles.tabPressed : null,
                      pressed && !itemDisabled ? styles?.tabPressed : null,
                    ]}
                  >
                    <Column align="center">
                      {iconNode === undefined ? null : (
                        <View
                          testID="icon-container"
                          style={[tokenStyles.iconBox, styles?.icon]}
                        >
                          {renderTextNode(iconNode, text => (
                            <Text>{text}</Text>
                          ))}
                        </View>
                      )}
                      {renderTitle(titleNode, titleWeight, titleColor, [
                        styles?.titleText,
                        isSelected ? styles?.titleTextActive : null,
                        itemDisabled ? styles?.titleTextDisabled : null,
                      ])}
                    </Column>
                  </View>
                  {hasBadge ? (
                    <View
                      testID="tab-bar-badge"
                      style={[
                        tokenStyles.badge,
                        isDotBadge ? tokenStyles.badgeDot : null,
                        styles?.badge,
                      ]}
                    >
                      {isDotBadge ? (
                        badgeNode
                      ) : (
                        <Text
                          color="lightSolid"
                          size="xs"
                          style={styles?.badgeText}
                          weight="semibold"
                        >
                          {formatBadgeText(badgeNode as string | number)}
                        </Text>
                      )}
                    </View>
                  ) : null}
                </>
              )}
            </Pressable>
          );
        })}
      </Row>
    </Row>
  );
}
