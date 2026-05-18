import { View, type ViewStyle } from 'react-native';

import type { CarouselProps, CarouselStyles } from './types';

interface CarouselIndicatorProps {
  indicator: CarouselProps['indicator'];
  externalStyles?: CarouselStyles;
  total: number;
  current: number;
  activeColor: string;
  inactiveColor: string;
  styles: {
    indicatorContainer: ViewStyle;
    indicatorDot: ViewStyle;
    indicatorDotActive: ViewStyle;
  };
}

export const CarouselIndicator = (props: CarouselIndicatorProps) => {
  const {
    indicator,
    externalStyles,
    total,
    current,
    activeColor,
    inactiveColor,
    styles,
  } = props;

  if (indicator === false) return null;
  if (total <= 1) return null;

  if (typeof indicator === 'function') {
    return indicator(total, current);
  }

  return (
    <View style={[styles.indicatorContainer, externalStyles?.indicator]}>
      {Array.from({ length: total }, (_, i) => {
        const isActive = i === current;
        return (
          <View
            key={i}
            style={[
              styles.indicatorDot,
              { backgroundColor: isActive ? activeColor : inactiveColor },
              isActive && styles.indicatorDotActive,
              externalStyles?.indicatorDot,
              isActive && externalStyles?.indicatorDotActive,
            ]}
          />
        );
      })}
    </View>
  );
};
