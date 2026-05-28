import type { ComponentSize } from '../shares/types';
import React, { useRef } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Column } from '../Column';
import { Row } from '../Row';
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
import type { TextColor, TextSize, TextWeight } from '../Text';
import type {
  IndexBarItem,
  IndexBarProps,
  IndexBarValue,
} from './types';

const DEFAULT_SIZE: ComponentSize = 'normal';

interface IndexTextProps {
  color: TextColor;
  size: TextSize;
  weight: TextWeight;
}

function resolveSize(size?: ComponentSize): ComponentSize {
  return size ?? DEFAULT_SIZE;
}

function renderTextNode(
  node: ReactNode,
  textProps: IndexTextProps,
  style: StyleProp<TextStyle>,
  testID?: string,
) {
  if (node === undefined || node === null || node === false) {
    return null;
  }

  if (typeof node === 'string' || typeof node === 'number') {
    return (
      <Text
        color={textProps.color}
        size={textProps.size}
        style={style}
        testID={testID}
        weight={textProps.weight}
      >
        {node}
      </Text>
    );
  }

  return node;
}

function getIndexTextSize(size: ComponentSize): TextSize {
  if (size === 'small') {
    return 'sm';
  }

  if (size === 'large') {
    return 'lg';
  }

  return 'md';
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
  const indexTextSize = getIndexTextSize(resolvedSize);

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
    <Row testID="index-bar-root" style={[tokenStyles.root, style]}>
      <ScrollView
        ref={scrollViewRef}
        testID="index-bar-content"
        style={[tokenStyles.content, styles?.content]}
      >
        <Column gap={resolvedSize} style={tokenStyles.panelList}>
          {data.map((panel, panelIndex) => (
            <View
              key={String(panel.index)}
              testID={`index-bar-panel-${String(panel.index)}`}
              style={[tokenStyles.panel, styles?.panel, panel.style]}
              onLayout={event => updatePanelOffset(panel.index, event)}
            >
              <Column
                style={[
                  tokenStyles.panelTitleContainer,
                  styles?.panelTitleContainer,
                ]}
              >
                {panel.title ??
                  renderTextNode(
                    panel.titleText ?? String(panel.index),
                    {
                      color: 'secondary',
                      size: 'sm',
                      weight: 'strong',
                    },
                    [tokenStyles.panelTitleText, styles?.panelTitleText],
                    `index-bar-panel-title-text-${String(panel.index)}`,
                  )}
              </Column>
              {renderPanel?.(panel, panelIndex)}
            </View>
          ))}
        </Column>
      </ScrollView>
      <Column
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
              {renderTextNode(
                panel.index,
                {
                  color: itemDisabled
                    ? 'disabled'
                    : isSelected
                      ? 'primary'
                      : 'secondary',
                  size: indexTextSize,
                  weight: isSelected ? 'strong' : 'regular',
                },
                [
                  tokenStyles.indexText,
                  styles?.indexText,
                  isSelected ? tokenStyles.indexTextActive : null,
                  isSelected ? styles?.indexTextActive : null,
                  itemDisabled ? tokenStyles.indexTextDisabled : null,
                  itemDisabled ? styles?.indexTextDisabled : null,
                ],
                `index-bar-index-text-${String(panel.index)}`,
              )}
            </Pressable>
          );
        })}
      </Column>
    </Row>
  );
}
