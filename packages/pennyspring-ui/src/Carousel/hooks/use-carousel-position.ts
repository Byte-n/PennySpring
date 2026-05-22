import { useCallback, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { useTheme } from '@pennyspring/theme';

/**
 * 轮播图位置和动画控制 Hook
 *
 * 管理轮播图的位置状态和动画执行，提供平滑的动画过渡和即时位置设置功能。
 * 使用 Animated.Value 实现原生驱动的动画，确保流畅的性能。
 *
 * @returns Hook 返回值
 * @returns position - Animated.Value 位置引用，用于动画变换
 * @returns positionValueRef - 当前位置值的引用，用于同步读取位置
 * @returns animateTo - 执行动画到指定位置的方法
 * @returns setPositionImmediate - 立即设置位置（无动画）的方法
 */
export const useCarouselPosition = () => {
  const { token } = useTheme();
  const position = useRef(new Animated.Value(0));
  const positionValueRef = useRef(0);

  const animateTo = useCallback((toValue: number, onFinished?: () => void) => {
    const listenerId = position.current.addListener(({ value }) => {
      positionValueRef.current = value;
    });
    Animated.timing(position.current, {
      toValue,
      duration: token.motionDurationSlow,
      easing: Easing.bezier(...token.motionEaseOut),
      useNativeDriver: true,
    }).start(({ finished }) => {
      position.current.removeListener(listenerId);
      if (finished) {
        positionValueRef.current = toValue;
        onFinished?.();
      }
    });
  }, [token]);

  const setPositionImmediate = useCallback((toValue: number) => {
    position.current.stopAnimation();
    position.current.setValue(toValue);
    positionValueRef.current = toValue;
  }, []);

  return {
    position,
    positionValueRef,
    animateTo,
    setPositionImmediate,
  };
};
