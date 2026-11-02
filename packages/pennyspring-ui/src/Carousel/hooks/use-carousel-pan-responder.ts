import { type RefObject, useMemo } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import {
  runOnJS,
  type SharedValue,
  useSharedValue,
} from 'react-native-reanimated';
import { clampValue } from '../utils';
import { useMemoizedFn } from '../../_hooks';

/** 主轴位移达到该值才激活轮播手势，避免轻触误触。 */
const AXIS_ACTIVATION_OFFSET = 5;
/** 交叉轴位移超过该值时让手势失败，把滚动交还给外层 ScrollView。 */
const CROSS_AXIS_FAIL_OFFSET = 10;
const VELOCITY_PROJECTION_FACTOR = 2000;

interface UseCarouselPanResponderParams {
  allowTouchMove: boolean;
  total: number;
  slidePixels: number;
  direction: 'horizontal' | 'vertical';
  extTotal: number;
  clonesBefore: number;
  position: SharedValue<number>;
  extIndexRef: RefObject<number>;
  setDragging: (dragging: boolean) => void;
  setAnimating: (animating: boolean) => void;
  updateCurrent: (index: number) => void;
  getIndexFromExtIndex: (extIndex: number) => number;
  getBoundedPosition: (position: number) => number;
  swipeToExtIndex: (extIndex: number) => void;
}

export const useCarouselPanResponder = (
  params: UseCarouselPanResponderParams,
) => {
  const {
    allowTouchMove,
    total,
    slidePixels,
    direction,
    extTotal,
    clonesBefore,
    position,
    extIndexRef,
    setDragging,
    setAnimating,
    updateCurrent,
    getIndexFromExtIndex,
    getBoundedPosition,
    swipeToExtIndex,
  } = params;

  const startPosition = useSharedValue(0);

  const syncDragIndex = useMemoizedFn((extIndex: number) => {
    extIndexRef.current = extIndex;
    updateCurrent(getIndexFromExtIndex(extIndex));
  });

  return useMemo(() => {
    if (!allowTouchMove || total <= 1 || slidePixels <= 0) {
      return null;
    }

    const axisIsHorizontal = direction === 'horizontal';
    const axisOffset: [number, number] = [
      -AXIS_ACTIVATION_OFFSET,
      AXIS_ACTIVATION_OFFSET,
    ];
    const crossAxisOffset: [number, number] = [
      -CROSS_AXIS_FAIL_OFFSET,
      CROSS_AXIS_FAIL_OFFSET,
    ];

    const pan = Gesture.Pan().enabled(allowTouchMove);

    // 只按主轴方向激活，并在交叉轴超限时失败，
    // 使外层 ScrollView 能接管另一个方向的滚动。
    if (axisIsHorizontal) {
      pan.activeOffsetX(axisOffset).failOffsetY(crossAxisOffset);
    } else {
      pan.activeOffsetY(axisOffset).failOffsetX(crossAxisOffset);
    }

    pan
      .onBegin(() => {
        'worklet';
        startPosition.value = position.value;
        runOnJS(setDragging)(true);
        runOnJS(setAnimating)(false);
      })
      .onUpdate(event => {
        'worklet';
        const delta = axisIsHorizontal
          ? event.translationX
          : event.translationY;
        let nextPosition = startPosition.value - delta;

        if (extTotal > total && slidePixels > 0) {
          const totalPixels = total * slidePixels;
          const minPos = (clonesBefore - 1) * slidePixels;
          const maxPos = (clonesBefore + total) * slidePixels;
          while (nextPosition < minPos) {
            nextPosition += totalPixels;
            startPosition.value += totalPixels;
          }
          while (nextPosition > maxPos) {
            nextPosition -= totalPixels;
            startPosition.value -= totalPixels;
          }
        }

        const bounded = getBoundedPosition(nextPosition);
        position.value = bounded;

        const nextExtIndex = clampValue(
          Math.round(bounded / slidePixels),
          0,
          extTotal - 1,
        );

        runOnJS(syncDragIndex)(nextExtIndex);
      })
      .onEnd(event => {
        'worklet';
        const velocity = axisIsHorizontal ? event.velocityX : event.velocityY;
        const baseIndex = position.value / slidePixels;
        const projectedIndex =
          (position.value - velocity * VELOCITY_PROJECTION_FACTOR) /
          slidePixels;

        const minAdj = Math.floor(baseIndex);
        const maxAdj = minAdj + 1;
        const rounded = Math.round(projectedIndex);
        const adjacent = clampValue(rounded, minAdj, maxAdj);

        runOnJS(setDragging)(false);
        runOnJS(swipeToExtIndex)(adjacent);
      })
      .onFinalize(() => {
        'worklet';
        runOnJS(setDragging)(false);
      });

    return pan;
  }, [
    allowTouchMove,
    clonesBefore,
    direction,
    extTotal,
    getBoundedPosition,
    position,
    setAnimating,
    setDragging,
    slidePixels,
    startPosition,
    swipeToExtIndex,
    syncDragIndex,
    total,
  ]);
};
