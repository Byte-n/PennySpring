import React, { useState } from 'react';
import {
  Animated,
  Pressable,
  View,
  type Animated as ReactNativeAnimated,
  type LayoutChangeEvent,
  type TextStyle,
} from 'react-native';
import { createUseSheetStyle, toShadowStyle } from '@pennyspring/theme';
import { Text } from '../Text';
import type { SegmentedControlStyles } from './types';

interface RouteLike {
  key: string;
  name: string;
}

interface DescriptorLike {
  options?: {
    title?: string;
    tabBarLabel?:
      | string
      | ((
          props: { focused: boolean; color: string; children: string }
        ) => React.ReactNode);
  };
}

interface SegmentedControlProps {
  descriptors: Record<string, DescriptorLike>;
  navigation: {
    navigate: (name: string) => void;
  };
  position?: {
    interpolate?: (config: {
      inputRange: number[];
      outputRange: number[];
      extrapolate?: 'clamp';
    }) => number | ReactNativeAnimated.AnimatedNode;
    value?: number;
  };
  state: {
    index: number;
    routes: readonly RouteLike[];
  };
  styles?: SegmentedControlStyles;
}

const useStyles = createUseSheetStyle((token) => ({
  container: {
    alignSelf: 'center',
  },
  track: {
    backgroundColor: token.colorBgLayout,
    borderRadius: token.borderRadius,
    flexDirection: 'row',
    minHeight: token.controlHeightSM,
    padding: token.paddingXXS,
    position: 'relative',
  },
  indicator: {
    backgroundColor: token.colorBgElevated,
    borderRadius: token.borderRadiusSM,
    bottom: token.paddingXXS,
    left: token.paddingXXS,
    position: 'absolute',
    top: token.paddingXXS,
    ...toShadowStyle(token.boxShadowTertiary),
  },
  option: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: token.controlHeightSM,
    paddingHorizontal: token.paddingSM,
    position: 'relative',
    zIndex: token.zIndexBase + 1,
  },
  label: {
    fontFamily: token.fontFamily,
    fontSize: token.fontSize,
    lineHeight: token.lineHeight,
  },
  activeLabel: {
    color: token.colorText,
    fontWeight: String(token.fontWeightSemiBold) as TextStyle['fontWeight'],
  },
  inactiveLabel: {
    color: token.colorTextTertiary,
  },
}));

interface TabLayout {
  width: number;
  x: number;
}

function updateRouteLayout(
  currentLayouts: Record<string, TabLayout>,
  routeKey: string,
  layout: TabLayout
): Record<string, TabLayout> {
  const currentLayout = currentLayouts[routeKey];

  if (currentLayout?.width === layout.width && currentLayout.x === layout.x) {
    return currentLayouts;
  }

  return {
    ...currentLayouts,
    [routeKey]: layout,
  };
}

function getRouteLabel(route: RouteLike, descriptor?: DescriptorLike): string {
  const tabBarLabel = descriptor?.options?.tabBarLabel;

  if (typeof tabBarLabel === 'string') {
    return tabBarLabel;
  }

  return descriptor?.options?.title ?? route.name;
}

export function SegmentedControl({
  descriptors,
  navigation,
  position,
  state,
  styles,
}: SegmentedControlProps) {
  const tokenStyles = useStyles();
  const [tabLayouts, setTabLayouts] = useState<Record<string, TabLayout>>({});
  const inputRange = state.routes.map((_, index) => index);
  const outputRange = state.routes.map((route) => tabLayouts[route.key]?.x ?? 0);
  const selectedLayout = tabLayouts[state.routes[state.index]?.key] ?? {
    width: 0,
    x: 0,
  };
  const translateX = position?.interpolate?.({
    inputRange,
    outputRange,
    extrapolate: 'clamp',
  }) ?? selectedLayout.x;
  const indicatorStyle = {
    transform: [{ translateX }],
    width: selectedLayout.width,
  };

  const updateTabLayout = (routeKey: string, event: LayoutChangeEvent) => {
    const { width, x } = event.nativeEvent.layout;

    setTabLayouts((currentLayouts) =>
      updateRouteLayout(currentLayouts, routeKey, {
        width,
        x,
      })
    );
  };

  return (
    <View style={tokenStyles.container}>
      <View
        style={[tokenStyles.track, styles?.track]}
      >
        <Animated.View
          style={[tokenStyles.indicator, indicatorStyle, styles?.indicator]}
          testID="top-tab-segment-indicator"
        />
        {state.routes.map((route, index) => {
          const isSelected = state.index === index;
          const label = getRouteLabel(route, descriptors[route.key]);

          return (
            <Pressable
              key={route.key}
              onLayout={(event) => updateTabLayout(route.key, event)}
              onPress={() => navigation.navigate(route.name)}
              style={[tokenStyles.option, styles?.option]}
              testID={`top-tab-segment-option-${route.key}`}
            >
              <Text
                numberOfLines={1}
                style={[
                  tokenStyles.label,
                  styles?.label,
                  isSelected
                    ? tokenStyles.activeLabel
                    : tokenStyles.inactiveLabel,
                ]}
                testID="top-tab-segment-label"
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
