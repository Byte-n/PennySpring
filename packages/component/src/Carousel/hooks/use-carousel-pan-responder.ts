import { clamp } from 'lodash-es';
import { type RefObject, useMemo, useRef } from 'react';
import {
  type Animated,
  PanResponder,
  type PanResponderInstance,
} from 'react-native';

/**
 * 手势识别最小移动距离（像素）
 */
const GESTURE_MIN_DISTANCE = 5;

/**
 * 速度投影系数（用于计算惯性滑动距离）
 */
const VELOCITY_PROJECTION_FACTOR = 2000;

interface UseCarouselPanResponderParams {
  allowTouchMove: boolean;
  total: number;
  slidePixels: number;
  direction: 'horizontal' | 'vertical';
  extTotal: number;
  clonesBefore: number;
  blockNativeResponder: boolean;
  position: RefObject<Animated.Value>;
  positionValueRef: RefObject<number>;
  extIndexRef: RefObject<number>;
  setDragging: (dragging: boolean) => void;
  setAnimating: (animating: boolean) => void;
  updateCurrent: (index: number) => void;
  getIndexFromExtIndex: (extIndex: number) => number;
  getBoundedPosition: (position: number) => number;
  swipeToExtIndex: (extIndex: number) => void;
}

/**
 * 轮播图手势响应 Hook
 *
 * 创建并管理 PanResponder，处理用户的拖动手势，实现轮播图的滑动交互。
 * 支持水平和垂直方向的滑动，处理循环播放时的边界循环逻辑，
 * 并根据滑动速度和距离计算最终停留位置。
 *
 * @param params - Hook 参数配置
 * @param params.allowTouchMove - 是否允许手势滑动
 * @param params.total - 轮播项总数
 * @param params.slidePixels - 单个滑块的像素大小
 * @param params.direction - 滑动方向（horizontal/vertical）
 * @param params.extTotal - 扩展总数（包含克隆项）
 * @param params.clonesBefore - 循环播放时前置克隆节点数量
 * @param params.blockNativeResponder - 是否阻断原生手势响应
 * @param params.position - Animated.Value 位置引用
 * @param params.positionValueRef - 当前位置值的引用
 * @param params.extIndexRef - 扩展索引的引用
 * @param params.setDragging - 设置拖动状态
 * @param params.setAnimating - 设置动画状态
 * @param params.updateCurrent - 更新当前索引
 * @param params.getIndexFromExtIndex - 从扩展索引获取逻辑索引
 * @param params.getBoundedPosition - 获取边界限制后的位置
 * @param params.swipeToExtIndex - 切换到扩展索引
 *
 * @returns PanResponderInstance 或 null（当不允许滑动或轮播项少于 2 个时）
 */
export const useCarouselPanResponder = (
  params: UseCarouselPanResponderParams,
): PanResponderInstance | null => {
  const {
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
  } = params;

  // 使用 ref 存储回调，减少 PanResponder 重建
  const callbacksRef = useRef({
    setDragging,
    setAnimating,
    updateCurrent,
    getIndexFromExtIndex,
    getBoundedPosition,
    swipeToExtIndex,
  });

  // 更新回调 ref
  callbacksRef.current = {
    setDragging,
    setAnimating,
    updateCurrent,
    getIndexFromExtIndex,
    getBoundedPosition,
    swipeToExtIndex,
  };

  return useMemo(() => {
    if (!allowTouchMove) return null;
    if (total <= 1) return null;
    if (slidePixels <= 0) return null;

    let startPosition = 0;
    const axis = direction === 'horizontal' ? 'x' : 'y';

    const shouldSet = (_: unknown, gestureState: { dx: number; dy: number }) => {
      const primary = axis === 'x' ? gestureState.dx : gestureState.dy;
      return Math.abs(primary) >= GESTURE_MIN_DISTANCE;
    };

    return PanResponder.create({
      onMoveShouldSetPanResponder: shouldSet,
      onPanResponderGrant: () => {
        callbacksRef.current.setDragging(true);
        callbacksRef.current.setAnimating(false);
        position.current.stopAnimation();
        startPosition = positionValueRef.current;
      },
      onPanResponderMove: (_evt, gestureState) => {
        const delta = axis === 'x' ? gestureState.dx : gestureState.dy;
        let nextPosition = startPosition - delta;

        // loop 开启时,拖动到最外层有效克隆中心之外则循环偏移,保证视口内始终有内容
        // minPos/maxPos 是 outermost before/after clone 的中心位置,由 clonesBefore 公式保证此范围内视口始终被覆盖
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

        const bounded = callbacksRef.current.getBoundedPosition(nextPosition);
        position.current.setValue(bounded);
        positionValueRef.current = bounded;

        const nextExtIndex = clamp(
          Math.round(bounded / slidePixels),
          0,
          extTotal - 1,
        );
        extIndexRef.current = nextExtIndex;
        callbacksRef.current.updateCurrent(
          callbacksRef.current.getIndexFromExtIndex(nextExtIndex),
        );
      },
      onPanResponderRelease: (_evt, gestureState) => {
        callbacksRef.current.setDragging(false);
        const velocity = axis === 'x' ? gestureState.vx : gestureState.vy;
        position.current.stopAnimation(value => {
          const baseIndex = value / slidePixels;
          const projectedIndex =
            (value - velocity * VELOCITY_PROJECTION_FACTOR) / slidePixels;

          const minAdj = Math.floor(baseIndex);
          const maxAdj = minAdj + 1;
          const rounded = Math.round(projectedIndex);
          const adjacent = clamp(rounded, minAdj, maxAdj);
          callbacksRef.current.swipeToExtIndex(adjacent);
        });
      },
      onPanResponderTerminate: () => {
        callbacksRef.current.setDragging(false);
        callbacksRef.current.swipeToExtIndex(extIndexRef.current);
      },
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => blockNativeResponder,
    });
  }, [
    allowTouchMove,
    blockNativeResponder,
    clonesBefore,
    direction,
    extTotal,
    extIndexRef,
    position,
    positionValueRef,
    slidePixels,
    total,
  ]);
};
