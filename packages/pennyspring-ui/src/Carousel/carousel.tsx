import React, { useCallback, useMemo, useState } from 'react';
import { type LayoutChangeEvent, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useTheme } from '@pennyspring/theme';

import { Column } from '../Column';
import { useControllableValue } from '../_hooks';
import { CarouselIndicator } from './carousel-indicator';
import { CarouselSlides } from './carousel-slides';
import {
  useCarouselAutoplay,
  useCarouselIndex,
  useCarouselLifecycle,
  useCarouselPanResponder,
  useCarouselPosition,
  useCarouselSwipe,
} from './hooks';
import {
  CAROUSEL_DOT_ACTIVE_WIDTH,
  CAROUSEL_DOT_SIZE,
  useCarouselStyles,
} from './style';
import type { CarouselProps } from './types';
import { clampValue } from './utils';

interface LayoutState {
  width: number;
  height: number;
}

const VIRTUAL_RENDER_THRESHOLD = 10;

export const Carousel = <Data = unknown,>(props: CarouselProps<Data>) => {
  const {
    defaultValue,
    value,
    onChange,
    allowTouchMove = true,
    autoplay = false,
    autoplayInterval = 4000,
    loop = false,
    direction = 'horizontal',
    indicator,
    slideSize = 100,
    trackOffset = 0,
    stuckAtBoundary = true,
    rubberband = true,
    virtualOverscan = 2,
    data,
    renderItem,
    style,
    styles: externalStyles,
    ref,
  } = props;

  const { token } = useTheme();
  const mergedDefaultValue = defaultValue ?? 0;
  const [currentValue = 0, setCurrentValue] = useControllableValue(
    mergedDefaultValue,
    value,
    onChange,
  );

  const [layout, setLayout] = useState<LayoutState>({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const { normalizedSlideSize, normalizedTrackOffset } = useMemo(() => {
    const slideSize_ = Number.isFinite(slideSize)
      ? clampValue(slideSize, 0, 100)
      : 100;
    const trackOffset_ = stuckAtBoundary
      ? 100 - slideSize_
      : Number.isFinite(trackOffset)
        ? clampValue(trackOffset, 0, 100 - slideSize_)
        : 0;

    return {
      normalizedSlideSize: slideSize_,
      normalizedTrackOffset: trackOffset_,
    };
  }, [slideSize, stuckAtBoundary, trackOffset]);

  const total = data.length;
  const loopEnabled = loop && total > 1;

  const clonesBefore = useMemo(() => {
    if (!loopEnabled) return 0;
    if (normalizedSlideSize <= 0) return 1;

    const offsetSlides = Math.ceil(normalizedTrackOffset / normalizedSlideSize);
    return Math.max(1, offsetSlides + 1);
  }, [loopEnabled, normalizedSlideSize, normalizedTrackOffset]);

  const clonesAfter = useMemo(() => {
    if (!loopEnabled) return 0;
    if (normalizedSlideSize <= 0) return 1;

    const remainingSpace = 100 - normalizedTrackOffset - normalizedSlideSize;
    const trailingSlides = Math.ceil(remainingSpace / normalizedSlideSize);
    return Math.max(1, trailingSlides + 1);
  }, [loopEnabled, normalizedSlideSize, normalizedTrackOffset]);

  const extTotal = loopEnabled ? total + clonesBefore + clonesAfter : total;

  const { slidePixels, trackOffsetPixels } = useMemo(() => {
    const trackSize = direction === 'horizontal' ? layout.width : layout.height;
    if (trackSize <= 0) return { slidePixels: 0, trackOffsetPixels: 0 };

    return {
      slidePixels: trackSize * (normalizedSlideSize / 100),
      trackOffsetPixels: trackSize * (normalizedTrackOffset / 100),
    };
  }, [
    direction,
    layout.height,
    layout.width,
    normalizedSlideSize,
    normalizedTrackOffset,
  ]);

  const {
    current,
    updateCurrent,
    extIndexRef,
    reportIndexRef,
    maybeReportIndex,
    getExtIndexFromIndex,
    getIndexFromExtIndex,
    getTargetExtIndexForIndex,
    getBoundedPosition,
  } = useCarouselIndex({
    total,
    loopEnabled,
    clonesBefore,
    slidePixels,
    normalizedSlideSize,
    normalizedTrackOffset,
    stuckAtBoundary,
    rubberband,
    current: currentValue,
    onCurrentChange: setCurrentValue,
  });

  const { position, animateTo, setPositionImmediate } = useCarouselPosition();

  const { swipeNext, swipePrev, swipeToExtIndex } = useCarouselSwipe({
    total,
    loopEnabled,
    clonesBefore,
    slidePixels,
    extTotal,
    extIndexRef,
    getBoundedPosition,
    getIndexFromExtIndex,
    getTargetExtIndexForIndex,
    updateCurrent,
    maybeReportIndex,
    setAnimating: setIsAnimating,
    animateTo,
    setPositionImmediate,
    ref,
  });

  useCarouselAutoplay({
    autoplay,
    autoplayInterval,
    total,
    dragging: isDragging,
    current,
    swipeNext,
    swipePrev,
  });

  useCarouselLifecycle({
    total,
    defaultIndex: currentValue,
    slidePixels,
    extIndexRef,
    reportIndexRef,
    getExtIndexFromIndex,
    getBoundedPosition,
    updateCurrent,
    setPositionImmediate,
  });

  const onLayoutTrack = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setLayout(prev =>
      prev.width === width && prev.height === height ? prev : { width, height },
    );
  }, []);

  const panGesture = useCarouselPanResponder({
    allowTouchMove,
    total,
    slidePixels,
    direction,
    extTotal,
    clonesBefore,
    position,
    extIndexRef,
    setDragging: setIsDragging,
    setAnimating: setIsAnimating,
    updateCurrent,
    getIndexFromExtIndex,
    getBoundedPosition,
    swipeToExtIndex,
  });

  const virtualRange = useMemo(() => {
    if (total <= 0 || slidePixels <= 0) return null;

    const isVirtual = total > VIRTUAL_RENDER_THRESHOLD;
    const isInteracting = isDragging || isAnimating;
    const effectiveOverscan = isVirtual
      ? Math.max(virtualOverscan, isInteracting ? 1 : 0)
      : virtualOverscan;

    const currentExtIndex = loopEnabled ? current + clonesBefore : current;
    const start = isVirtual
      ? clampValue(currentExtIndex - effectiveOverscan, 0, extTotal - 1)
      : 0;
    const end = isVirtual
      ? clampValue(currentExtIndex + effectiveOverscan, 0, extTotal - 1)
      : extTotal - 1;

    return { start, end, isVirtual };
  }, [
    clonesBefore,
    current,
    extTotal,
    isAnimating,
    isDragging,
    loopEnabled,
    slidePixels,
    total,
    virtualOverscan,
  ]);

  const leadingSize = virtualRange ? virtualRange.start * slidePixels : 0;
  const trailingSize = virtualRange
    ? (extTotal - virtualRange.end - 1) * slidePixels
    : 0;

  const styles = useCarouselStyles({
    direction,
    slidePixels,
    leadingSize,
    trailingSize,
  });

  const trackInnerStyle =
    direction === 'horizontal'
      ? styles.trackInnerHorizontal
      : styles.trackInnerVertical;

  const trackTransformStyle = useAnimatedStyle(() => {
    const translate = -position.value + trackOffsetPixels;
    return direction === 'horizontal'
      ? { transform: [{ translateX: translate }] }
      : { transform: [{ translateY: translate }] };
  }, [direction, trackOffsetPixels]);

  if (!data || data.length === 0) {
    return null;
  }

  const content = (
    <Column style={[styles.container, style]} testID="carousel-root">
      <View style={styles.track} onLayout={onLayoutTrack}>
        <Animated.View
          style={[styles.trackInner, trackInnerStyle, trackTransformStyle]}
        >
          <CarouselSlides<Data>
            data={data}
            renderItem={renderItem}
            total={total}
            virtualRange={virtualRange}
            loopEnabled={loopEnabled}
            clonesBefore={clonesBefore}
            extTotal={extTotal}
            styles={{
              slideWrapper: styles.slideWrapper,
              spacerLeading: styles.spacerLeading,
              spacerTrailing: styles.spacerTrailing,
            }}
          />
        </Animated.View>
        <CarouselIndicator
          indicator={indicator}
          externalStyles={externalStyles}
          total={total}
          current={current}
          styles={styles}
          dotSize={CAROUSEL_DOT_SIZE}
          activeDotWidth={CAROUSEL_DOT_ACTIVE_WIDTH}
          transitionDuration={token.motionDurationMid}
        />
      </View>
    </Column>
  );

  if (!panGesture) {
    return content;
  }

  return (
    <GestureDetector
      gesture={panGesture}
      touchAction={direction === 'horizontal' ? 'pan-y' : 'pan-x'}
    >
      {content}
    </GestureDetector>
  );
};
