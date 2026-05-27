import { useMemoizedFn } from '../../_hooks';
import { useCallback, useRef } from 'react';
import { clampValue } from '../utils';

/**
 * 橡皮筋效果阻尼系数
 */
const RUBBERBAND_DAMPING = 0.35;

interface UseCarouselIndexParams {
  total: number;
  loopEnabled: boolean;
  clonesBefore: number;
  slidePixels: number;
  normalizedSlideSize: number;
  normalizedTrackOffset: number;
  stuckAtBoundary: boolean;
  rubberband: boolean;
  current: number;
  onCurrentChange: (index: number) => void;
}

/**
 * 轮播图索引管理 Hook
 *
 * 管理轮播图的索引状态和索引转换逻辑，包括：
 * - 当前索引状态管理
 * - 逻辑索引与扩展索引（包含克隆项）之间的转换
 * - 目标索引计算（处理循环边界）
 * - 位置边界限制（橡皮筋效果）
 * - 索引变化回调
 *
 * @param params - Hook 参数配置
 * @param params.total - 轮播项总数
 * @param params.loopEnabled - 是否启用循环播放
 * @param params.clonesBefore - 循环播放时前置克隆节点数量
 * @param params.slidePixels - 单个滑块的像素大小
 * @param params.normalizedSlideSize - 归一化的滑块大小百分比
 * @param params.normalizedTrackOffset - 归一化的轨道偏移百分比
 * @param params.stuckAtBoundary - 是否在边界处卡住
 * @param params.rubberband - 是否开启橡皮筋效果
 * @param params.onIndexChange - 索引变化回调
 *
 * @returns Hook 返回值
 * @returns current - 当前索引
 * @returns updateCurrent - 更新当前索引的方法
 * @returns extIndexRef - 扩展索引的引用
 * @returns reportIndexRef - 已报告索引的引用
 * @returns maybeReportIndex - 可能触发索引变化回调的方法
 * @returns getExtIndexFromIndex - 从逻辑索引获取扩展索引
 * @returns getIndexFromExtIndex - 从扩展索引获取逻辑索引
 * @returns getTargetExtIndexForIndex - 获取目标扩展索引（处理循环边界）
 * @returns getBoundedPosition - 获取边界限制后的位置（橡皮筋效果）
 */
export const useCarouselIndex = (params: UseCarouselIndexParams) => {
  const {
    total,
    loopEnabled,
    clonesBefore,
    slidePixels,
    normalizedSlideSize,
    normalizedTrackOffset,
    stuckAtBoundary,
    rubberband,
    current,
    onCurrentChange,
  } = params;
  const extIndexRef = useRef(0);
  const reportIndexRef = useRef<number | null>(null);

  const updateCurrent = useCallback(
    (next: number) => {
      const normalized = total > 0 ? clampValue(next, 0, total - 1) : 0;
      onCurrentChange(normalized);
    },
    [onCurrentChange, total],
  );

  const maybeReportIndex = useMemoizedFn((index: number) => {
    if (reportIndexRef.current === index) return;
    reportIndexRef.current = index;
    onCurrentChange(index);
  });

  const getExtIndexFromIndex = useCallback(
    (index: number) => {
      if (!loopEnabled) return index;
      return clampValue(index, 0, total - 1) + clonesBefore;
    },
    [clonesBefore, loopEnabled, total],
  );

  const getIndexFromExtIndex = useCallback(
    (extIndex: number) => {
      if (!loopEnabled) return clampValue(extIndex, 0, total - 1);
      if (extIndex < clonesBefore) {
        return (((extIndex - clonesBefore) % total) + total) % total;
      }
      if (extIndex >= clonesBefore + total) {
        return (extIndex - clonesBefore - total) % total;
      }
      return extIndex - clonesBefore;
    },
    [clonesBefore, loopEnabled, total],
  );

  const getTargetExtIndexForIndex = useCallback(
    (targetIndex: number) => {
      if (!loopEnabled) return clampValue(targetIndex, 0, total - 1);

      const currentExt = extIndexRef.current;
      const normalizedTarget = clampValue(targetIndex, 0, total - 1);
      const targetExt = normalizedTarget + clonesBefore;

      if (currentExt === clonesBefore && normalizedTarget === total - 1)
        return clonesBefore - 1;
      if (currentExt === clonesBefore + total - 1 && normalizedTarget === 0)
        return clonesBefore + total;
      return targetExt;
    },
    [clonesBefore, loopEnabled, total],
  );

  const getBoundedPosition = useMemoizedFn((nextPosition: number) => {
    if (loopEnabled) return nextPosition;
    if (slidePixels <= 0) return nextPosition;
    if (total <= 0) return 0;

    // 计算轮播边界索引范围
    let min = 0;
    let max = total - 1;
    if (stuckAtBoundary) {
      const slideRatio = normalizedSlideSize / 100;
      const offsetRatio = normalizedTrackOffset / 100;
      min = 0 + offsetRatio / (slideRatio || 1);
      max = total - 1 - (1 - slideRatio - offsetRatio) / (slideRatio || 1);
    }
    const minPos = min * slidePixels;
    const maxPos = max * slidePixels;

    if (nextPosition < minPos) {
      if (!rubberband) return minPos;
      return minPos - (minPos - nextPosition) * RUBBERBAND_DAMPING;
    }
    if (nextPosition > maxPos) {
      if (!rubberband) return maxPos;
      return maxPos + (nextPosition - maxPos) * RUBBERBAND_DAMPING;
    }
    return nextPosition;
  });

  return {
    current,
    updateCurrent,
    extIndexRef,
    reportIndexRef,
    maybeReportIndex,
    getExtIndexFromIndex,
    getIndexFromExtIndex,
    getTargetExtIndexForIndex,
    getBoundedPosition,
  };
};
