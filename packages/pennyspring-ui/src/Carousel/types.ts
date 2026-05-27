import type { ReactNode, Ref } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

/** Carousel 组件暴露的实例方法 */
export interface CarouselRef {
  swipeTo: (index: number) => void;
  swipeNext: () => void;
  swipePrev: () => void;
}

export interface CarouselStyles {
  indicator?: StyleProp<ViewStyle>;
  indicatorDot?: StyleProp<ViewStyle>;
  indicatorDotActive?: StyleProp<ViewStyle>;
}

export interface CarouselProps<Data = unknown> {
  value?: number;
  defaultValue?: number;
  onChange?: (index: number) => void;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  allowTouchMove?: boolean;
  autoplay?: boolean | 'reverse';
  autoplayInterval?: number;
  loop?: boolean;
  direction?: 'horizontal' | 'vertical';
  indicator?: false | ((total: number, current: number) => ReactNode);
  slideSize?: number;
  trackOffset?: number;
  stuckAtBoundary?: boolean;
  rubberband?: boolean;
  virtualOverscan?: number;
  data: Data[];
  renderItem: (item: Data, index: number) => ReactNode;
  blockNativeResponder?: boolean;
  style?: StyleProp<ViewStyle>;
  styles?: CarouselStyles;
  ref?: Ref<CarouselRef>;
}
