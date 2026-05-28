import type { ComponentSize } from '../shares/types';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Column } from '../Column';
import { Row } from '../Row';
import { Text } from '../Text';
import { useControllableValue } from '../_hooks';
import { useStyles } from './style';
import type { ReactNode } from 'react';
import type { TextColor, TextSize } from '../Text';
import type { TabsItem, TabsProps, TabsValue } from './types';

function toTextSize(size: ComponentSize): TextSize {
  if (size === 'small') {
    return 'sm';
  }

  if (size === 'large') {
    return 'lg';
  }

  return 'md';
}

function getLabel(item: TabsItem): ReactNode {
  if (item.label !== undefined) {
    return item.label;
  }

  if (item.labelText !== undefined) {
    return item.labelText;
  }

  return undefined;
}

function renderLabel(
  label: ReactNode,
  size: TextSize,
  weight: 'regular' | 'strong',
  color: TextColor,
  style: TabsProps['styles'],
) {
  if (label === undefined || label === null || label === false) {
    return null;
  }

  if (typeof label === 'string' || typeof label === 'number') {
    return (
      <Text color={color} size={size} style={style?.label} weight={weight}>
        {label}
      </Text>
    );
  }

  return label;
}

function getInitialValue(items: TabsItem[], defaultValue?: TabsValue): TabsValue | undefined {
  if (defaultValue !== undefined) {
    return defaultValue;
  }

  return items.find(item => !item.disabled)?.value;
}

function renderItem(
  item: TabsItem,
  itemDisabled: boolean,
  isSelected: boolean,
  size: TextSize,
  block: boolean,
  rest: Omit<TabsProps, 'items' | 'value' | 'defaultValue' | 'onChange' | 'disabled' | 'size' | 'layout' | 'block' | 'style' | 'styles' | 'onPress' | 'renderContent'>,
  tokenStyles: ReturnType<typeof useStyles>,
  styles: TabsProps['styles'],
  onPress: TabsProps['onPress'],
  setSelectedValue: (value: TabsValue) => void,
) {
  const labelColor: TextColor = itemDisabled
    ? 'disabled'
    : isSelected
      ? 'heading'
      : 'secondary';
  const labelWeight = isSelected ? 'strong' : 'regular';

  return (
    <Pressable
      {...rest}
      key={String(item.value)}
      testID={`tabs-item-${String(item.value)}`}
      disabled={itemDisabled}
      onPress={event => {
        if (itemDisabled || isSelected) {
          return;
        }

        onPress?.(event, item.value);
        setSelectedValue(item.value);
      }}
      style={({ pressed }) => [
        tokenStyles.tab,
        block ? tokenStyles.tabBlock : null,
        styles?.tab,
        isSelected ? tokenStyles.tabActive : null,
        isSelected ? styles?.tabActive : null,
        pressed && !itemDisabled ? tokenStyles.tabPressed : null,
        pressed && !itemDisabled ? styles?.tabPressed : null,
        itemDisabled ? tokenStyles.tabDisabled : null,
        itemDisabled ? styles?.tabDisabled : null,
      ]}
    >
      {renderLabel(
        getLabel(item),
        size,
        labelWeight,
        labelColor,
        styles,
      )}
    </Pressable>
  );
}

export function Tabs({
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
}: TabsProps) {
  const tokenStyles = useStyles({ block, disabled, size });
  const textSize = toTextSize(size);
  const normalizedItems = useMemo(() => [...items], [items]);
  const [selectedValue, setSelectedValue] = useControllableValue(
    getInitialValue(normalizedItems, defaultValue),
    value,
    onChange,
  );

  const selectedIndex = normalizedItems.findIndex(item => item.value === selectedValue);
  const selectedItem = selectedIndex >= 0 ? normalizedItems[selectedIndex] : undefined;

  const renderItems = () =>
    normalizedItems.map(item => {
      const itemDisabled = disabled || item.disabled === true;
      const isSelected = selectedValue === item.value;

      return renderItem(
        item,
        itemDisabled,
        isSelected,
        textSize,
        block,
        rest,
        tokenStyles,
        styles,
        onPress,
        setSelectedValue,
      );
    });

  return (
    <Column testID="tabs-root" style={[tokenStyles.root, style]}>
      {layout === 'scroll' ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={tokenStyles.scrollList}
          contentContainerStyle={[tokenStyles.tabList, styles?.tabList]}
          testID="tabs-list-scroll"
        >
          {renderItems()}
        </ScrollView>
      ) : (
        <Row
          testID="tabs-list"
          wrap
          style={[tokenStyles.tabList, styles?.tabList]}
        >
          {renderItems()}
        </Row>
      )}
      {selectedItem !== undefined && renderContent !== undefined ? (
        <View testID="tabs-panel" style={[tokenStyles.panel, styles?.panel]}>
          {renderContent(selectedItem, selectedIndex)}
        </View>
      ) : null}
    </Column>
  );
}
