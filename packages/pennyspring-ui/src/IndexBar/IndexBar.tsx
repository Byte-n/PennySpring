import type { ComponentSize } from '../shares/types';
import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@pennyspring/theme';
import { Row } from '../Row';
import { Text } from '../Text';
import { useControllableValue } from '../_hooks';
import { useStyles } from './style';
import type { ReactNode } from 'react';
import type {
  GestureResponderEvent,
  LayoutChangeEvent,
  ScrollView as ScrollViewType,
  StyleProp,
  TextStyle,
} from 'react-native';
import type { TextColor, TextSize, TextWeight } from '../Text';
import type { IndexBarItem, IndexBarProps, IndexBarValue } from './types';

const DEFAULT_SIZE: ComponentSize = 'normal';
const BUBBLE_SCALE_MIN = 0.92;
const BUBBLE_SCALE_RANGE = 0.08;
const LAST_INDEX_OFFSET = 0.9999;

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
  renderItem,
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
  const sidebarHeightRef = useRef(0);
  const lastDragIndexRef = useRef<number | null>(null);
  const resolvedSize = resolveSize(size);
  const { token } = useTheme();
  const tokenStyles = useStyles({
    disabled,
    size: resolvedSize,
  });
  const [bubbleValue, setBubbleValue] = useState<IndexBarValue | null>(null);
  const bubbleOpacity = useSharedValue(0);
  const bubbleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: bubbleOpacity.value,
    transform: [
      { scale: BUBBLE_SCALE_MIN + BUBBLE_SCALE_RANGE * bubbleOpacity.value },
    ],
  }));

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

  const showBubble = (panelValue: IndexBarValue) => {
    setBubbleValue(panelValue);
    bubbleOpacity.value = withTiming(1, {
      duration: token.motionDurationFast,
    });
  };

  const hideBubble = () => {
    bubbleOpacity.value = withTiming(0, {
      duration: token.motionDurationMid,
    });
  };

  const activatePanel = (
    panel: IndexBarItem,
    event: GestureResponderEvent,
    showBubbleOnActivate: boolean,
  ) => {
    if (disabled || panel.disabled === true) {
      return;
    }

    if (showBubbleOnActivate) {
      showBubble(panel.index);
    }

    if (selectedValue === panel.index) {
      return;
    }

    onPress?.(event, panel.index);
    setSelectedValue(panel.index);
    scrollToPanel(panel.index);
  };

  const handleDrag = (event: GestureResponderEvent) => {
    if (disabled || data.length === 0) {
      return;
    }

    const sidebarHeight = sidebarHeightRef.current;

    if (sidebarHeight <= 0) {
      return;
    }

    const ratio = Math.min(
      Math.max(event.nativeEvent.locationY / sidebarHeight, 0),
      LAST_INDEX_OFFSET,
    );
    const index = Math.floor(ratio * data.length);
    const panel = data[index];

    if (panel === undefined || lastDragIndexRef.current === index) {
      return;
    }

    lastDragIndexRef.current = index;
    showBubble(panel.index);
    onPress?.(event, panel.index);
    setSelectedValue(panel.index);
    scrollToPanel(panel.index);
  };

  const endDrag = () => {
    lastDragIndexRef.current = null;
    hideBubble();
  };

  const panelElements = data.flatMap((panel, panelIndex) => {
    const title = (
      <View
        key={`index-bar-title-${String(panel.index)}`}
        testID={`index-bar-panel-${String(panel.index)}`}
        style={[tokenStyles.panelTitleContainer, styles?.panelTitleContainer]}
        onLayout={event => updatePanelOffset(panel.index, event)}
      >
        {panel.title ??
          renderTextNode(
            panel.titleText ?? String(panel.index),
            {
              color: 'tertiary',
              size: 'xs',
              weight: 'semibold',
            },
            [tokenStyles.panelTitleText, styles?.panelTitleText],
            `index-bar-panel-title-text-${String(panel.index)}`,
          )}
      </View>
    );
    const body = (
      <View
        key={`index-bar-body-${String(panel.index)}`}
        testID={`index-bar-panel-body-${String(panel.index)}`}
        style={[tokenStyles.panel, styles?.panel, panel.style]}
      >
        {renderItem?.(panel, panelIndex)}
      </View>
    );

    return [title, body];
  });

  return (
    <Row testID="index-bar-root" style={[tokenStyles.root, style]}>
      <View style={tokenStyles.contentWrapper}>
        <ScrollView
          ref={scrollViewRef}
          scrollEnabled
          testID="index-bar-content"
          style={[tokenStyles.content, styles?.content]}
          stickyHeaderIndices={data.map((_, index) => index * 2)}
        >
          {panelElements}
        </ScrollView>
        <View pointerEvents="none" style={tokenStyles.bubbleOverlay}>
          <Animated.View
            style={[tokenStyles.bubble, bubbleAnimatedStyle]}
            testID="index-bar-bubble"
          >
            {bubbleValue === null ? null : (
              <Text
                color="primary"
                size="xl"
                weight="semibold"
                style={tokenStyles.bubbleText}
              >
                {String(bubbleValue)}
              </Text>
            )}
          </Animated.View>
        </View>
      </View>
      <View
        testID="index-bar-sidebar"
        style={[tokenStyles.sidebar, styles?.sidebar]}
        onLayout={event => {
          sidebarHeightRef.current = event.nativeEvent.layout.height;
        }}
        onMoveShouldSetResponderCapture={() => !disabled}
        onResponderGrant={handleDrag}
        onResponderMove={handleDrag}
        onResponderRelease={endDrag}
        onResponderTerminate={endDrag}
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

                activatePanel(panel, event, false);
              }}
              onPressIn={() => {
                if (!itemDisabled) {
                  showBubble(panel.index);
                }
              }}
              onPressOut={hideBubble}
              style={({ pressed }) => [
                tokenStyles.indexItem,
                styles?.indexItem,
                pressed && !itemDisabled ? tokenStyles.indexItemPressed : null,
                pressed && !itemDisabled ? styles?.indexItemPressed : null,
              ]}
            >
              <View
                style={[
                  tokenStyles.indexLetter,
                  isSelected ? tokenStyles.indexLetterActive : null,
                  isSelected ? styles?.indexItemActive : null,
                ]}
              >
                {renderTextNode(
                  panel.index,
                  {
                    color: itemDisabled
                      ? 'quaternary'
                      : isSelected
                        ? 'lightSolid'
                        : 'secondary',
                    size: 'xs',
                    weight: 'semibold',
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
              </View>
            </Pressable>
          );
        })}
      </View>
    </Row>
  );
}
