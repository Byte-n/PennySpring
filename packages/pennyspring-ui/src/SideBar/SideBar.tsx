import type { ComponentSize } from '../shares/types';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Text } from '../Text';
import { useControllableValue } from '../_hooks';
import { useStyles } from './style';
import type { ReactNode } from 'react';
import type {
  TextStyle,
} from 'react-native';
import type {
  StyleProp,
} from 'react-native';
import type {
  TextColor,
  TextSize,
  TextWeight,
} from '../Text';
import type {
  SideBarItem,
  SideBarProps,
  SideBarValue,
} from './types';

function toTextSize(size: ComponentSize): TextSize {
  if (size === 'small') {
    return 'sm';
  }

  if (size === 'large') {
    return 'lg';
  }

  return 'md';
}

function renderLabel(
  labelText: string | undefined,
  label: ReactNode | undefined | null,
  size: ComponentSize,
  selected: boolean,
  disabled: boolean,
  style: StyleProp<TextStyle>,
) {
  const content = label ?? labelText;

  if (content === undefined || content === null || content === false) {
    return null;
  }

  if (typeof content === 'string' || typeof content === 'number') {
    const weight: TextWeight = 'regular';
    const color: TextColor = disabled
      ? 'disabled'
      : selected
        ? 'default'
        : 'secondary';

    return (
      <Text color={color} size={toTextSize(size)} style={style} weight={weight}>
        {content}
      </Text>
    );
  }

  return content;
}

function getInitialValue(
  items: SideBarItem[],
  defaultValue?: SideBarValue,
): SideBarValue | undefined {
  if (defaultValue !== undefined) {
    return defaultValue;
  }

  return items.find(item => !item.disabled)?.value;
}

export function SideBar({
  items,
  value,
  defaultValue,
  onChange,
  disabled = false,
  size = 'normal',
  layout = 'wrap',
  block = false,
  style,
  styles,
  onPress,
  renderContent,
  ...rest
}: SideBarProps) {
  const tokenStyles = useStyles({ block, disabled, layout, size });
  const normalizedItems = useMemo(() => [...items], [items]);
  const [selectedValue, setSelectedValue] = useControllableValue(
    getInitialValue(normalizedItems, defaultValue),
    value,
    onChange,
  );

  const selectedIndex = normalizedItems.findIndex(item => item.value === selectedValue);
  const selectedItem = selectedIndex >= 0 ? normalizedItems[selectedIndex] : undefined;

  return (
    <View testID="sidebar-root" style={[tokenStyles.root, style]}>
      {layout === 'scroll' ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[tokenStyles.sideBarList, styles?.sideBarList]}
          testID="sidebar-list-scroll"
        >
          {normalizedItems.map(item => {
            const itemDisabled = disabled || item.disabled === true;
            const isSelected = selectedValue === item.value;

            return (
              <Pressable
                {...rest}
                key={String(item.value)}
                testID={`sidebar-item-${String(item.value)}`}
                disabled={itemDisabled}
                onPress={event => {
                  if (itemDisabled || isSelected) {
                    return;
                  }

                  onPress?.(event, item.value);
                  setSelectedValue(item.value);
                }}
                style={({ pressed }) => [
                  tokenStyles.sideBar,
                  block ? tokenStyles.sideBarBlock : null,
                  isSelected ? tokenStyles.sideBarActive : null,
                  pressed && !itemDisabled ? tokenStyles.sideBarPressed : null,
                  itemDisabled ? tokenStyles.sideBarDisabled : null,
                  styles?.sideBar,
                ]}
              >
                {renderLabel(
                  item.labelText,
                  item.label,
                  size,
                  isSelected,
                  itemDisabled,
                  [
                    styles?.label,
                    isSelected ? styles?.labelActive : null,
                    itemDisabled ? styles?.labelDisabled : null,
                  ],
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      ) : (
        <View testID="sidebar-list" style={[tokenStyles.sideBarList, styles?.sideBarList]}>
          {normalizedItems.map(item => {
            const itemDisabled = disabled || item.disabled === true;
            const isSelected = selectedValue === item.value;

            return (
              <Pressable
                {...rest}
                key={String(item.value)}
                testID={`sidebar-item-${String(item.value)}`}
                disabled={itemDisabled}
                onPress={event => {
                  if (itemDisabled || isSelected) {
                    return;
                  }

                  onPress?.(event, item.value);
                  setSelectedValue(item.value);
                }}
                style={({ pressed }) => [
                  tokenStyles.sideBar,
                  block ? tokenStyles.sideBarBlock : null,
                  isSelected ? tokenStyles.sideBarActive : null,
                  pressed && !itemDisabled ? tokenStyles.sideBarPressed : null,
                  itemDisabled ? tokenStyles.sideBarDisabled : null,
                  styles?.sideBar,
                ]}
              >
                {renderLabel(
                  item.labelText,
                  item.label,
                  size,
                  isSelected,
                  itemDisabled,
                  [
                    styles?.label,
                    isSelected ? styles?.labelActive : null,
                    itemDisabled ? styles?.labelDisabled : null,
                  ],
                )}
              </Pressable>
            );
          })}
        </View>
      )}
      {selectedItem !== undefined && renderContent !== undefined ? (
        <View testID="sidebar-panel" style={[tokenStyles.panel, styles?.panel]}>
          {renderContent(selectedItem, selectedIndex)}
        </View>
      ) : null}
    </View>
  );
}
