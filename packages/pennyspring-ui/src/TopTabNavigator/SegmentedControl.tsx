import React, { useEffect, useState } from 'react';
import { Pressable, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@pennyspring/theme';
import { Text } from '../Text';
import { useSegmentedControlStyles } from './style';
import type {
  DescriptorLike,
  RouteLike,
  SegmentedControlProps,
} from './types';

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

function getRouteLabel(
  route: RouteLike,
  descriptor?: DescriptorLike
): string {
  const tabBarLabel = descriptor?.options?.tabBarLabel;

  if (typeof tabBarLabel === 'string') {
    return tabBarLabel;
  }

  return descriptor?.options?.title ?? route.name;
}

export function SegmentedControl({
  descriptors,
  navigation,
  state,
  styles,
}: SegmentedControlProps) {
  const tokenStyles = useSegmentedControlStyles();
  const { token } = useTheme();
  const [tabLayouts, setTabLayouts] = useState<Record<string, TabLayout>>({});
  const selectedIndex = useSharedValue(state.index);

  useEffect(() => {
    selectedIndex.value = withTiming(state.index, {
      duration: token.motionDurationFast,
      easing: Easing.bezier(...token.motionEaseOut),
    });
  }, [state.index, selectedIndex, token.motionDurationFast, token.motionEaseOut]);

  const indicatorAnimatedStyle = useAnimatedStyle(() => {
    const currentIndex = selectedIndex.value;
    const roundedIndex = Math.round(currentIndex);
    const routes = state.routes;
    const currentKey = routes[roundedIndex]?.key;
    const nextKey = routes[roundedIndex + 1]?.key;
    const prevKey = routes[roundedIndex - 1]?.key;

    const currentX = tabLayouts[currentKey]?.x ?? 0;
    const currentWidth = tabLayouts[currentKey]?.width ?? 0;
    const fraction = currentIndex - roundedIndex;

    let translateX: number;
    let width: number;

    if (fraction > 0 && nextKey !== undefined) {
      const nextX = tabLayouts[nextKey]?.x ?? currentX;
      translateX = currentX + fraction * (nextX - currentX);
      const nextWidth = tabLayouts[nextKey]?.width ?? currentWidth;
      width = currentWidth + fraction * (nextWidth - currentWidth);
    } else if (fraction < 0 && prevKey !== undefined) {
      const prevX = tabLayouts[prevKey]?.x ?? currentX;
      translateX = currentX + fraction * (prevX - currentX);
      const prevWidth = tabLayouts[prevKey]?.width ?? currentWidth;
      width = currentWidth + fraction * (prevWidth - currentWidth);
    } else {
      translateX = currentX;
      width = currentWidth;
    }

    return {
      transform: [{ translateX }],
      width,
    };
  });

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
      <View style={[tokenStyles.track, styles?.track]}>
        <Animated.View
          style={[tokenStyles.indicator, indicatorAnimatedStyle, styles?.indicator]}
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
