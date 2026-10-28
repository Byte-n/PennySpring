import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import React from 'react';

import { Row } from '../Row';
import { Text } from '../Text';
import type { CarouselProps, CarouselStyles } from './types';
import type { CarouselStyleSheet } from './style';

export const CAROUSEL_COUNTER_THRESHOLD = 8;

interface CarouselIndicatorProps {
  indicator: CarouselProps['indicator'];
  externalStyles?: CarouselStyles;
  total: number;
  current: number;
  styles: CarouselStyleSheet;
  dotSize: number;
  activeDotWidth: number;
  transitionDuration: number;
}

interface CarouselDotProps {
  active: boolean;
  duration: number;
  baseStyle: StyleProp<ViewStyle>;
  activeStyle: StyleProp<ViewStyle>;
  externalStyle?: StyleProp<ViewStyle>;
  externalActiveStyle?: StyleProp<ViewStyle>;
  activeWidth: number;
  idleWidth: number;
}

function CarouselDot({
  active,
  activeStyle,
  activeWidth,
  baseStyle,
  duration,
  externalActiveStyle,
  externalStyle,
  idleWidth,
}: CarouselDotProps) {
  const width = useSharedValue(active ? activeWidth : idleWidth);
  const animatedStyle = useAnimatedStyle(() => ({
    width: width.value,
  }));

  React.useEffect(() => {
    width.value = withTiming(active ? activeWidth : idleWidth, { duration });
  }, [active, activeWidth, duration, idleWidth, width]);

  return (
    <Animated.View
      style={[
        baseStyle,
        animatedStyle,
        active ? activeStyle : undefined,
        externalStyle,
        active ? externalActiveStyle : undefined,
      ]}
    />
  );
}

export const CarouselIndicator = (props: CarouselIndicatorProps) => {
  const {
    activeDotWidth,
    current,
    dotSize,
    externalStyles,
    indicator,
    styles,
    total,
    transitionDuration,
  } = props;

  if (indicator === false) return null;
  if (total <= 1) return null;

  if (typeof indicator === 'function') {
    return indicator(total, current);
  }

  if (total > CAROUSEL_COUNTER_THRESHOLD) {
    return (
      <View
        style={[styles.indicatorCounter, externalStyles?.indicator]}
        testID="carousel-counter"
      >
        <Text color="lightSolid" size="xs" style={styles.indicatorCounterText}>
          {`${current + 1} / ${total}`}
        </Text>
      </View>
    );
  }

  return (
    <Row
      align="center"
      justify="center"
      style={[styles.indicatorContainer, externalStyles?.indicator]}
      testID="carousel-indicator"
    >
      {Array.from({ length: total }, (_, i) => (
        <CarouselDot
          key={i}
          active={i === current}
          activeStyle={styles.indicatorDotActive}
          activeWidth={activeDotWidth}
          baseStyle={styles.indicatorDot}
          duration={transitionDuration}
          externalActiveStyle={externalStyles?.indicatorDotActive}
          externalStyle={externalStyles?.indicatorDot}
          idleWidth={dotSize}
        />
      ))}
    </Row>
  );
};
