import { type RefObject, useMemo } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, type SharedValue } from 'react-native-reanimated';
import { clampValue } from '../utils';

const GESTURE_MIN_DISTANCE = 5;
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

  return useMemo(() => {
    if (!allowTouchMove || total <= 1 || slidePixels <= 0) {
      return null;
    }

    const axisIsHorizontal = direction === 'horizontal';
    let startPosition = 0;

    const pan = Gesture.Pan()
      .enabled(allowTouchMove)
      .minDistance(GESTURE_MIN_DISTANCE)
      .onBegin(() => {
        startPosition = position.value;
        runOnJS(setDragging)(true);
        runOnJS(setAnimating)(false);
      })
      .onUpdate(event => {
        const delta = axisIsHorizontal
          ? event.translationX
          : event.translationY;
        let nextPosition = startPosition - delta;

        if (extTotal > total && slidePixels > 0) {
          const totalPixels = total * slidePixels;
          const minPos = (clonesBefore - 1) * slidePixels;
          const maxPos = (clonesBefore + total) * slidePixels;
          while (nextPosition < minPos) {
            nextPosition += totalPixels;
            startPosition += totalPixels;
          }
          while (nextPosition > maxPos) {
            nextPosition -= totalPixels;
            startPosition -= totalPixels;
          }
        }

        const bounded = getBoundedPosition(nextPosition);
        position.value = bounded;

        const nextExtIndex = clampValue(
          Math.round(bounded / slidePixels),
          0,
          extTotal - 1,
        );

        runOnJS(() => {
          extIndexRef.current = nextExtIndex;
          updateCurrent(getIndexFromExtIndex(nextExtIndex));
        })();
      })
      .onEnd(event => {
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
        runOnJS(setDragging)(false);
      });

    return pan;
  }, [
    allowTouchMove,
    clonesBefore,
    direction,
    extIndexRef,
    extTotal,
    getBoundedPosition,
    getIndexFromExtIndex,
    position,
    setAnimating,
    setDragging,
    slidePixels,
    swipeToExtIndex,
    total,
    updateCurrent,
  ]);
};
