import React, { useCallback, useMemo, useState } from 'react';
import {
  Animated,
  type LayoutChangeEvent,
  Pressable,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';


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
import { useCarouselStyles } from './style';
import type { CarouselProps } from './types';
import { useTheme } from '@pennyspring/theme';
import { clampValue } from './utils';

interface LayoutState {
  width: number;
  height: number;
}

/**
 * 虚拟渲染触发阈值
 * 当轮播项数量超过此值时启用虚拟渲染优化
 */
const VIRTUAL_RENDER_THRESHOLD = 10;

/**
 * 轮播图组件
 *
 * 支持水平/垂直滑动、循环播放、自动轮播、虚拟渲染等功能的高性能轮播组件。
 *
 * @example
 * ```tsx
 * // 基础用法
 * <Carousel
 *   data={[1, 2, 3]}
 *   renderItem={(item) => <View><Text>{item}</Text></View>}
 * />
 *
 * // 循环播放和自动轮播
 * <Carousel
 *   data={items}
 *   renderItem={(item) => <View>{item.content}</View>}
 *   loop
 *   autoplay
 *   autoplayInterval={3000}
 * />
 *
 * // 虚拟渲染（大量数据）
 * <Carousel
 *   data={largeDataArray}
 *   renderItem={(item, index) => <View><Text>{index}: {item}</Text></View>}
 * />
 * ```
 *
 * @param props - 组件属性
 * @returns 轮播图组件
 */
export const Carousel = <Data = unknown,>(props: CarouselProps<Data>) => {
  const {
    defaultIndex = 0,
    allowTouchMove = true,
    autoplay = false,
    autoplayInterval = 3000,
    loop = false,
    direction = 'horizontal',
    onIndexChange,
    indicatorProps,
    indicator,
    slideSize = 100,
    trackOffset = 0,
    stuckAtBoundary = true,
    rubberband = true,
    virtualOverscan = 2,
    data,
    renderItem,
    style,
    blockNativeResponder = true,
    ref,
  } = props;

  const styles = useCarouselStyles();
  const { token } = useTheme();

  // 使用 state 存储 layout，使依赖更明确
  const [layout, setLayout] = useState<LayoutState>({ width: 0, height: 0 });

  // 分离拖动和动画状态，避免状态冲突
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // 合并归一化计算，减少 useMemo 调用
  const { normalizedSlideSize, normalizedTrackOffset } = useMemo(() => {
    const slideSize_ = Number.isFinite(slideSize)
      ? clampValue(slideSize, 0, 100)
      : 100;
    let trackOffset_: number;
    if (stuckAtBoundary) {
      trackOffset_ = 100 - slideSize_;
    } else {
      trackOffset_ = Number.isFinite(trackOffset)
        ? clampValue(trackOffset, 0, 100 - slideSize_)
        : 0;
    }
    return {
      normalizedSlideSize: slideSize_,
      normalizedTrackOffset: trackOffset_,
    };
  }, [slideSize, trackOffset, stuckAtBoundary]);

  const total = data.length;

  const loopEnabled = loop && total > 1;

  // 计算循环播放时需要克隆的前置节点数量
  // 若是非全屏的轮播项，则在循环播放开启的情况下，则会在下一轮展示第一项时看见下一项为空白（或闪烁），这需要额外渲染更多的项（与offset、slideSize相关）
  const clonesBefore = useMemo(() => {
    if (!loopEnabled) return 0;
    if (normalizedSlideSize <= 0) return 1;

    const offsetSlides = Math.ceil(normalizedTrackOffset / normalizedSlideSize);
    return Math.max(1, offsetSlides + 1);
  }, [loopEnabled, normalizedSlideSize, normalizedTrackOffset]);

  // 计算循环播放时需要克隆的后置节点数量
  const clonesAfter = useMemo(() => {
    if (!loopEnabled) return 0;
    if (normalizedSlideSize <= 0) return 1;

    const remainingSpace = 100 - normalizedTrackOffset - normalizedSlideSize;
    const trailingSlides = Math.ceil(remainingSpace / normalizedSlideSize);
    return Math.max(1, trailingSlides + 1);
  }, [loopEnabled, normalizedSlideSize, normalizedTrackOffset]);

  const extTotal = loopEnabled ? total + clonesBefore + clonesAfter : total;

  // 合并像素计算，减少重复的 trackSize 获取
  const { slidePixels, trackOffsetPixels } = useMemo(() => {
    const trackSize = direction === 'horizontal' ? layout.width : layout.height;
    if (trackSize <= 0) return { slidePixels: 0, trackOffsetPixels: 0 };
    return {
      slidePixels: trackSize * (normalizedSlideSize / 100),
      trackOffsetPixels: trackSize * (normalizedTrackOffset / 100),
    };
  }, [direction, layout, normalizedSlideSize, normalizedTrackOffset]);

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
    onIndexChange,
  });

  // 位置和动画控制
  const { position, positionValueRef, animateTo, setPositionImmediate } =
    useCarouselPosition();

  // 状态设置函数
  const setDragging = useCallback((dragging: boolean) => {
    setIsDragging(dragging);
  }, []);

  const setAnimating = useCallback((animating: boolean) => {
    setIsAnimating(animating);
  }, []);

  // 切换逻辑
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
    setAnimating,
    animateTo,
    setPositionImmediate,
    ref,
  });

  // 自动轮播
  useCarouselAutoplay({
    autoplay,
    autoplayInterval,
    total,
    dragging: isDragging,
    current,
    swipeNext,
    swipePrev,
  });

  // 生命周期管理
  useCarouselLifecycle({
    total,
    defaultIndex,
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
    setLayout(prev => {
      if (prev.width !== width || prev.height !== height) {
        return { width, height };
      }
      return prev;
    });
  }, []);

  const panResponder = useCarouselPanResponder({
    allowTouchMove,
    total,
    slidePixels,
    direction,
    extTotal,
    clonesBefore,
    blockNativeResponder,
    position,
    positionValueRef,
    extIndexRef,
    setDragging,
    setAnimating,
    updateCurrent,
    getIndexFromExtIndex,
    getBoundedPosition,
    swipeToExtIndex,
  });

  const trackTransformStyle: StyleProp<ViewStyle> = useMemo(() => {
    const translate = Animated.add(
      Animated.multiply(position.current, -1),
      trackOffsetPixels,
    );
    return direction === 'horizontal'
      ? { transform: [{ translateX: translate }] }
      : { transform: [{ translateY: translate }] };
  }, [direction, position, trackOffsetPixels]);

  // 计算虚拟渲染的范围
  // 使用 current 状态而不是 extIndexRef，确保虚拟范围与当前索引同步
  const virtualRange = useMemo(() => {
    if (total <= 0 || slidePixels <= 0) {
      return null;
    }

    const isVirtual = total > VIRTUAL_RENDER_THRESHOLD;
    const isInteracting = isDragging || isAnimating;
    const effectiveOverscan = isVirtual
      ? Math.max(virtualOverscan, isInteracting ? 1 : 0)
      : virtualOverscan;

    // 使用 current 计算 extIndex，确保响应式更新
    const currentExtIndex = loopEnabled ? current + clonesBefore : current;
    const start = isVirtual
      ? clampValue(currentExtIndex - effectiveOverscan, 0, extTotal - 1)
      : 0;
    const end = isVirtual
      ? clampValue(currentExtIndex + effectiveOverscan, 0, extTotal - 1)
      : extTotal - 1;

    return { start, end, isVirtual };
  }, [
    total,
    slidePixels,
    virtualOverscan,
    isDragging,
    isAnimating,
    current,
    loopEnabled,
    clonesBefore,
    extTotal,
  ]);

  const trackInnerStyle =
    direction === 'horizontal'
      ? styles.trackInnerHorizontal
      : styles.trackInnerVertical;

  // 边界情况处理：空数据
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <Pressable
        style={styles.track}
        onLayout={onLayoutTrack}
        {...panResponder?.panHandlers}
      >
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
            direction={direction}
            slidePixels={slidePixels}
            extTotal={extTotal}
          />
        </Animated.View>
        <CarouselIndicator
          indicator={indicator}
          indicatorProps={indicatorProps}
          total={total}
          current={current}
          activeColor={token.colorPrimary}
          inactiveColor={token.colorPrimaryBg}
          styles={styles}
        />
      </Pressable>
    </View>
  );
};
