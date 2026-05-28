import { View, type StyleProp, type ViewStyle } from 'react-native';

import { Row } from '../Row';
import type { CarouselProps, CarouselStyles } from './types';

interface CarouselIndicatorProps {
  indicator: CarouselProps['indicator'];
  externalStyles?: CarouselStyles;
  total: number;
  current: number;
  styles: Record<string, StyleProp<ViewStyle>>;
}

export const CarouselIndicator = (props: CarouselIndicatorProps) => {
  const { indicator, externalStyles, total, current, styles } = props;

  if (indicator === false) return null;
  if (total <= 1) return null;

  if (typeof indicator === 'function') {
    return indicator(total, current);
  }

  return (
    <Row
      align="center"
      justify="center"
      style={[styles.indicatorContainer, externalStyles?.indicator]}
      testID="carousel-indicator"
    >
      {Array.from({ length: total }, (_, i) => {
        const isActive = i === current;
        return (
          <View
            key={i}
            style={[
              styles.indicatorDot,
              isActive && styles.indicatorDotActive,
              externalStyles?.indicatorDot,
              isActive && externalStyles?.indicatorDotActive,
            ]}
          />
        );
      })}
    </Row>
  );
};
