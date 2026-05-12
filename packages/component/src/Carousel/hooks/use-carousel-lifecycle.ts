import { clamp } from 'lodash-es';
import { type RefObject, useEffect } from 'react';

interface UseCarouselLifecycleParams {
  total: number;
  defaultIndex: number;
  slidePixels: number;
  extIndexRef: RefObject<number>;
  reportIndexRef: RefObject<number | null>;
  getExtIndexFromIndex: (index: number) => number;
  getBoundedPosition: (position: number) => number;
  updateCurrent: (index: number) => void;
  setPositionImmediate: (toValue: number) => void;
}

/**
 * 轮播图生命周期管理 Hook
 *
 * 管理轮播图的初始化和响应式更新：
 * - 初始化时设置默认索引和位置
 * - 响应 slidePixels 变化时更新位置
 * - 确保位置和索引状态的一致性
 *
 * @param params - Hook 参数配置
 * @param params.total - 轮播项总数
 * @param params.defaultIndex - 初始展示的索引
 * @param params.slidePixels - 单个滑块的像素大小
 * @param params.extIndexRef - 扩展索引的引用
 * @param params.reportIndexRef - 已报告索引的引用
 * @param params.getExtIndexFromIndex - 从逻辑索引获取扩展索引
 * @param params.getBoundedPosition - 获取边界限制后的位置
 * @param params.updateCurrent - 更新当前索引
 * @param params.setPositionImmediate - 立即设置位置
 */
export const useCarouselLifecycle = (params: UseCarouselLifecycleParams) => {
  const {
    total,
    defaultIndex,
    slidePixels,
    extIndexRef,
    reportIndexRef,
    getExtIndexFromIndex,
    getBoundedPosition,
    updateCurrent,
    setPositionImmediate,
  } = params;

  // 初始化位置
  useEffect(() => {
    if (total <= 0) {
      updateCurrent(0);
      reportIndexRef.current = null;
      extIndexRef.current = 0;
      setPositionImmediate(0);
      return;
    }

    const normalizedDefault = clamp(Math.round(defaultIndex), 0, total - 1);
    updateCurrent(normalizedDefault);
    reportIndexRef.current = normalizedDefault;

    const extIndex = getExtIndexFromIndex(normalizedDefault);
    extIndexRef.current = extIndex;
    if (slidePixels > 0) {
      setPositionImmediate(getBoundedPosition(extIndex * slidePixels));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    defaultIndex,
    getExtIndexFromIndex,
    getBoundedPosition,
    setPositionImmediate,
    slidePixels,
    total,
    updateCurrent,
    // refs 不需要在依赖数组中，它们的引用永远不变
  ]);

  // 响应 slidePixels 变化
  useEffect(() => {
    if (slidePixels <= 0) return;
    const extIndex = extIndexRef.current;
    setPositionImmediate(getBoundedPosition(extIndex * slidePixels));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getBoundedPosition, setPositionImmediate, slidePixels]);
};
