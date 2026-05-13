import { useMemoizedFn } from '../_hooks';
import { type ReactNode, useMemo } from 'react';
import { View, type ViewStyle } from 'react-native';
import { clampValue } from './utils';

interface CarouselSlidesProps<Data = unknown> {
  /** 数据源数组 */
  data: Data[];
  /** 渲染每一项的函数 */
  renderItem: (item: Data, index: number) => ReactNode;
  /** 轮播项总数 */
  total: number;
  /** 虚拟渲染范围（start、end、isVirtual） */
  virtualRange: {
    start: number;
    end: number;
    isVirtual: boolean;
  } | null;
  /** 是否启用循环播放 */
  loopEnabled: boolean;
  /** 循环播放时前置克隆节点数量 */
  clonesBefore: number;
  /** 滑动方向 */
  direction: 'horizontal' | 'vertical';
  /** 单个滑块的像素大小 */
  slidePixels: number;
  /** 扩展后的总数（包含克隆节点） */
  extTotal: number;
}

/**
 * 轮播图滑块渲染组件
 *
 * 负责渲染轮播图的滑块内容，使用 data + renderItem 模式。
 * 实现虚拟渲染优化，仅渲染可见范围内的滑块，并处理循环播放时的克隆逻辑。
 * 为虚拟渲染添加前后占位空间，确保滚动位置正确。
 *
 * @template Data - 数据项类型
 * @param props - 组件属性配置
 * @param props.data - 数据源数组
 * @param props.renderItem - 渲染每一项的函数
 * @param props.total - 轮播项总数
 * @param props.virtualRange - 虚拟渲染范围（start、end、isVirtual）
 * @param props.loopEnabled - 是否启用循环播放
 * @param props.clonesBefore - 循环播放时前置克隆节点数量
 * @param props.direction - 滑动方向
 * @param props.slidePixels - 单个滑块的像素大小
 * @param props.extTotal - 扩展后的总数（包含克隆节点）
 *
 * @returns 渲染的滑块内容或 null
 */
export const CarouselSlides = <Data = unknown,>(
  props: CarouselSlidesProps<Data>,
) => {
  const {
    data,
    renderItem,
    total,
    virtualRange,
    loopEnabled,
    clonesBefore,
    direction,
    slidePixels,
    extTotal,
  } = props;

  // 计算滑块包装器样式
  const slideWrapperStyle: ViewStyle = useMemo(() => {
    return direction === 'horizontal'
      ? { width: slidePixels, height: '100%' }
      : { height: slidePixels, width: '100%' };
  }, [direction, slidePixels]);

  // 计算虚拟渲染的占位空间样式
  const spacerStyles = useMemo(() => {
    if (!virtualRange) return null;

    const { start, end } = virtualRange;
    const leadingSize = start * slidePixels;
    const trailingSize = (extTotal - end - 1) * slidePixels;

    return {
      leading:
        direction === 'horizontal'
          ? { width: leadingSize }
          : { height: leadingSize },
      trailing:
        direction === 'horizontal'
          ? { width: trailingSize }
          : { height: trailingSize },
      leadingSize,
      trailingSize,
    };
  }, [virtualRange, slidePixels, extTotal, direction]);

  const getIndexFromExtIndex = useMemoizedFn((extIndex: number) => {
    if (!loopEnabled) return clampValue(extIndex, 0, total - 1);
    if (extIndex < clonesBefore) {
      return (((extIndex - clonesBefore) % total) + total) % total;
    }
    if (extIndex >= clonesBefore + total) {
      return (extIndex - clonesBefore - total) % total;
    }
    return extIndex - clonesBefore;
  });

  // 渲染滑块元素
  const slideElements = useMemo(() => {
    if (!virtualRange) return null;

    const { start, end } = virtualRange;
    const elements: ReactNode[] = [];

    const getElementForExtIndex = (extIndex: number) => {
      const logicalIndex = loopEnabled
        ? getIndexFromExtIndex(extIndex)
        : clampValue(extIndex, 0, total - 1);

      const item = data[logicalIndex];
      return renderItem(item, logicalIndex);
    };

    for (let extIndex = start; extIndex <= end; extIndex += 1) {
      const element = getElementForExtIndex(extIndex);
      if (!element) continue;
      elements.push(
        <View key={extIndex} style={slideWrapperStyle}>
          {element}
        </View>,
      );
    }

    return elements;
  }, [
    virtualRange,
    loopEnabled,
    total,
    data,
    renderItem,
    slideWrapperStyle,
    getIndexFromExtIndex,
  ]);

  // 前置占位空间
  const leadSpacer = useMemo(() => {
    if (
      !virtualRange?.isVirtual ||
      !spacerStyles ||
      spacerStyles.leadingSize <= 0
    ) {
      return null;
    }
    return <View style={spacerStyles.leading} />;
  }, [virtualRange?.isVirtual, spacerStyles]);

  // 后置占位空间
  const trailSpacer = useMemo(() => {
    if (
      !virtualRange?.isVirtual ||
      !spacerStyles ||
      spacerStyles.trailingSize <= 0
    ) {
      return null;
    }
    return <View style={spacerStyles.trailing} />;
  }, [virtualRange?.isVirtual, spacerStyles]);

  if (!virtualRange) return null;

  return (
    <>
      {leadSpacer}
      {slideElements}
      {trailSpacer}
    </>
  );
};
