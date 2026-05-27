import { useMemoizedFn } from '../../_hooks';
import { type RefObject, useImperativeHandle } from 'react';
import { clampValue } from '../utils';

interface UseCarouselSwipeParams {
  total: number;
  loopEnabled: boolean;
  clonesBefore: number;
  slidePixels: number;
  extTotal: number;
  extIndexRef: RefObject<number>;
  getBoundedPosition: (position: number) => number;
  getIndexFromExtIndex: (extIndex: number) => number;
  getTargetExtIndexForIndex: (targetIndex: number) => number;
  updateCurrent: (index: number) => void;
  maybeReportIndex: (index: number) => void;
  setAnimating: (animating: boolean) => void;
  animateTo: (toValue: number, onFinished?: () => void) => void;
  setPositionImmediate: (toValue: number) => void;
  ref?: React.Ref<{
    swipeTo: (index: number) => void;
    swipeNext: () => void;
    swipePrev: () => void;
  }>;
}

/**
 * 轮播图切换逻辑 Hook
 *
 * 实现轮播图的切换功能，包括切换到指定索引、下一项、上一项。
 * 处理循环播放时的边界无缝跳转，确保视觉上的连续性。
 * 通过 ref 暴露切换方法供外部调用。
 *
 * @param params - Hook 参数配置
 * @param params.total - 轮播项总数
 * @param params.loopEnabled - 是否启用循环播放
 * @param params.clonesBefore - 循环播放时前置克隆节点数量
 * @param params.slidePixels - 单个滑块的像素大小
 * @param params.extTotal - 扩展总数（包含克隆项）
 * @param params.extIndexRef - 扩展索引的引用
 * @param params.getBoundedPosition - 获取边界限制后的位置
 * @param params.getIndexFromExtIndex - 从扩展索引获取逻辑索引
 * @param params.getTargetExtIndexForIndex - 获取目标扩展索引
 * @param params.updateCurrent - 更新当前索引
 * @param params.maybeReportIndex - 可能触发索引变化回调
 * @param params.setAnimating - 设置动画状态
 * @param params.animateTo - 执行动画到指定位置
 * @param params.setPositionImmediate - 立即设置位置
 * @param params.ref - 组件 ref，用于暴露实例方法
 *
 * @returns Hook 返回值
 * @returns swipeTo - 切换到指定索引的方法
 * @returns swipeNext - 切换到下一项的方法
 * @returns swipePrev - 切换到上一项的方法
 * @returns swipeToExtIndex - 切换到扩展索引的方法
 * @returns finalizeLoopJumpIfNeeded - 完成循环边界跳转的方法
 */
export const useCarouselSwipe = (params: UseCarouselSwipeParams) => {
  const {
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
  } = params;

  const finalizeLoopJumpIfNeeded = useMemoizedFn(() => {
    if (!loopEnabled) return;
    const currentExt = extIndexRef.current;
    if (currentExt < clonesBefore) {
      const targetExt = currentExt + total;
      extIndexRef.current = targetExt;
      if (slidePixels > 0) setPositionImmediate(targetExt * slidePixels);
      return;
    }
    if (currentExt >= clonesBefore + total) {
      const targetExt = currentExt - total;
      extIndexRef.current = targetExt;
      if (slidePixels > 0) setPositionImmediate(targetExt * slidePixels);
    }
  });

  const swipeToExtIndex = useMemoizedFn((targetExtIndex: number) => {
    if (total <= 0) return;
    if (slidePixels <= 0) {
      extIndexRef.current = clampValue(targetExtIndex, 0, extTotal - 1);
      setAnimating(false);
      updateCurrent(getIndexFromExtIndex(extIndexRef.current));
      return;
    }

    const boundedExtIndex = clampValue(targetExtIndex, 0, extTotal - 1);
    extIndexRef.current = boundedExtIndex;

    const nextIndex = getIndexFromExtIndex(boundedExtIndex);
    updateCurrent(nextIndex);
    maybeReportIndex(nextIndex);

    const rawPosition = boundedExtIndex * slidePixels;
    const toPosition = getBoundedPosition(rawPosition);

    setAnimating(true);
    animateTo(toPosition, () => {
      finalizeLoopJumpIfNeeded();
      const normalizedIndex = getIndexFromExtIndex(extIndexRef.current);
      updateCurrent(normalizedIndex);
      maybeReportIndex(normalizedIndex);
      setAnimating(false);
    });
  });

  const swipeTo = useMemoizedFn((index: number) => {
    if (total <= 0) return;
    const targetIndex = clampValue(Math.round(index), 0, total - 1);
    const targetExtIndex = getTargetExtIndexForIndex(targetIndex);
    swipeToExtIndex(targetExtIndex);
  });

  const swipeNext = useMemoizedFn(() => {
    if (total <= 1) return;
    let currentExt = extIndexRef.current;
    // 若当前处于 after-clone 区域（快速连击导致 finalizeLoopJumpIfNeeded 尚未执行），
    // 立即将位置平移回真实 item 区域（视觉内容相同，不可感知），再继续前进
    if (clonesBefore > 0 && currentExt >= clonesBefore + total) {
      currentExt -= total;
      extIndexRef.current = currentExt;
      if (slidePixels > 0) setPositionImmediate(currentExt * slidePixels);
    }
    swipeToExtIndex(currentExt + 1);
  });

  const swipePrev = useMemoizedFn(() => {
    if (total <= 1) return;
    let currentExt = extIndexRef.current;
    // 若当前处于 before-clone 区域（快速连击导致 finalizeLoopJumpIfNeeded 尚未执行），
    // 立即将位置平移回真实 item 区域（视觉内容相同，不可感知），再继续后退
    if (clonesBefore > 0 && currentExt < clonesBefore) {
      currentExt += total;
      extIndexRef.current = currentExt;
      if (slidePixels > 0) setPositionImmediate(currentExt * slidePixels);
    }
    swipeToExtIndex(currentExt - 1);
  });

  useImperativeHandle(
    ref,
    () => ({
      swipeTo,
      swipeNext,
      swipePrev,
    }),
    [swipeNext, swipePrev, swipeTo],
  );

  return {
    swipeTo,
    swipeNext,
    swipePrev,
    swipeToExtIndex,
    finalizeLoopJumpIfNeeded,
  };
};
