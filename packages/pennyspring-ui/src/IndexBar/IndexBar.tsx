import type { ComponentSize } from '../shares/types';
import React, { useRef } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Text } from '../Text';
import { useControllableValue } from '../_hooks';
import { useStyles } from './style';
import type { ReactNode } from 'react';
import type {
  LayoutChangeEvent,
  ScrollView as ScrollViewType,
  StyleProp,
  TextStyle,
} from 'react-native';
import type {
  IndexBarItem,
  IndexBarProps,
  IndexBarValue,
} from './types';

const DEFAULT_SIZE: ComponentSize = 'normal';

function resolveSize(size?: ComponentSize): ComponentSize {
  return size ?? DEFAULT_SIZE;
}

function renderTextNode(node: ReactNode, style: StyleProp<TextStyle>) {
  if (node === undefined || node === null || node === false) {
    return null;
  }

  if (typeof node === 'string' || typeof node === 'number') {
    return <Text style={style}>{node}</Text>;
  }

  return node;
}

function getInitialValue(
  panels: readonly IndexBarItem[],
  defaultValue?: IndexBarValue,
): IndexBarValue | undefined {
  if (defaultValue !== undefined) {
    return defaultValue;
  }

  return panels.find(panel => panel.disabled !== true)?.index;
}

export function IndexBar({
  data,
  renderPanel,
  value,
  defaultValue,
  onChange,
  onPress,
  disabled = false,
  size,
  style,
  styles,
  ...rest
}: IndexBarProps) {
  const scrollViewRef = useRef<ScrollViewType | null>(null);
  const panelOffsetYRef = useRef<Record<string, number>>({});
  const resolvedSize = resolveSize(size);
  const tokenStyles = useStyles({
    disabled,
    size: resolvedSize,
  });

  const [selectedValue, setSelectedValue] = useControllableValue(
    getInitialValue(data, defaultValue),
    value,
    onChange,
  );

  const updatePanelOffset = (
    panelValue: IndexBarValue,
    event: LayoutChangeEvent,
  ) => {
    panelOffsetYRef.current = {
      ...panelOffsetYRef.current,
      [String(panelValue)]: event.nativeEvent.layout.y,
    };
  };

  const scrollToPanel = (panelValue: IndexBarValue) => {
    const offsetY = panelOffsetYRef.current[String(panelValue)];

    if (offsetY === undefined) {
      return;
    }

    scrollViewRef.current?.scrollTo({
      animated: true,
      y: offsetY,
    });
  };

  return (
    <View testID="index-bar-root" style={[tokenStyles.root, style]}>
      <ScrollView
        ref={scrollViewRef}
        testID="index-bar-content"
        style={[tokenStyles.content, styles?.content]}
      >
        {data.map((panel, panelIndex) => (
          <View
            key={String(panel.index)}
            testID={`index-bar-panel-${String(panel.index)}`}
            style={[tokenStyles.panel, styles?.panel, panel.style]}
            onLayout={event => updatePanelOffset(panel.index, event)}
          >
            <View
              style={[
                tokenStyles.panelTitleContainer,
                styles?.panelTitleContainer,
              ]}
            >
              {panel.title ?? renderTextNode(panel.titleText ?? String(panel.index), [
                tokenStyles.panelTitleText,
                styles?.panelTitleText,
              ])}
            </View>
            {renderPanel?.(panel, panelIndex)}
          </View>
        ))}
      </ScrollView>
      <View
        testID="index-bar-sidebar"
        style={[tokenStyles.sidebar, styles?.sidebar]}
      >
        {data.map(panel => {
          const itemDisabled = disabled || panel.disabled === true;
          const isSelected = selectedValue === panel.index;

          return (
            <Pressable
              {...rest}
              key={String(panel.index)}
              testID={`index-bar-item-${String(panel.index)}`}
              disabled={itemDisabled}
              onPress={event => {
                if (itemDisabled || isSelected) {
                  return;
                }

                onPress?.(event, panel.index);
                setSelectedValue(panel.index);
                scrollToPanel(panel.index);
              }}
              style={({ pressed }) => [
                tokenStyles.indexItem,
                styles?.indexItem,
                isSelected ? tokenStyles.indexItemActive : null,
                isSelected ? styles?.indexItemActive : null,
                pressed && !itemDisabled ? tokenStyles.indexItemPressed : null,
                pressed && !itemDisabled ? styles?.indexItemPressed : null,
                itemDisabled ? tokenStyles.indexItemDisabled : null,
                itemDisabled ? styles?.indexItemDisabled : null,
              ]}
            >
              {renderTextNode(panel.index, [
                tokenStyles.indexText,
                styles?.indexText,
                isSelected ? tokenStyles.indexTextActive : null,
                isSelected ? styles?.indexTextActive : null,
                itemDisabled ? tokenStyles.indexTextDisabled : null,
                itemDisabled ? styles?.indexTextDisabled : null,
              ])}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
