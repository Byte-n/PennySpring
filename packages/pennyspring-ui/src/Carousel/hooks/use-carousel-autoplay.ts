import { useEffect } from 'react';

interface UseCarouselAutoplayParams {
  autoplay: boolean | 'reverse';
  autoplayInterval: number;
  total: number;
  dragging: boolean;
  current: number;
  swipeNext: () => void;
  swipePrev: () => void;
}

/**
 * 轮播图自动轮播 Hook
 *
 * 管理轮播图的自动轮播功能，根据配置自动切换到下一项或上一项。
 * 在拖动时暂停自动轮播，拖动结束后恢复。
 * 支持正向和反向自动轮播。
 *
 * @param params - Hook 参数配置
 * @param params.autoplay - 自动轮播配置（false/true/'reverse'）
 * @param params.autoplayInterval - 自动轮播间隔（毫秒）
 * @param params.total - 轮播项总数
 * @param params.dragging - 是否正在拖动
 * @param params.current - 当前索引（用于触发重新计时）
 * @param params.swipeNext - 切换到下一项的方法
 * @param params.swipePrev - 切换到上一项的方法
 */
export const useCarouselAutoplay = (params: UseCarouselAutoplayParams) => {
  const {
    autoplay,
    autoplayInterval,
    total,
    dragging,
    current,
    swipeNext,
    swipePrev,
  } = params;

  useEffect(() => {
    if (!autoplay) return;
    if (total <= 1) return;
    if (dragging) return;
    if (autoplayInterval <= 0) return;

    const timer = setTimeout(() => {
      if (autoplay === 'reverse') swipePrev();
      else swipeNext();
    }, autoplayInterval);

    return () => {
      clearTimeout(timer);
    };
  }, [
    autoplay,
    autoplayInterval,
    dragging,
    swipeNext,
    swipePrev,
    total,
    current,
  ]);
};
