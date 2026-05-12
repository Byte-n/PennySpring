import { View, type ViewStyle } from 'react-native';

import type { CarouselProps } from './types';

interface CarouselIndicatorProps {
  /** 指示器配置（false 表示不显示，函数表示自定义渲染） */
  indicator: CarouselProps['indicator'];
  /** 指示器属性配置（颜色、样式） */
  indicatorProps: CarouselProps['indicatorProps'];
  /** 轮播项总数 */
  total: number;
  /** 当前激活的索引 */
  current: number;
  /** 激活状态的指示器颜色 */
  activeColor: string;
  /** 非激活状态的指示器颜色 */
  inactiveColor: string;
  /** 指示器样式对象 */
  styles: {
    indicatorContainer: ViewStyle;
    indicatorDot: ViewStyle;
    indicatorDotActive: ViewStyle;
  };
}

/**
 * 轮播图指示器渲染组件
 *
 * 负责渲染轮播图底部的指示器（小圆点），支持自定义指示器或使用默认样式。
 * 当轮播项总数小于等于 1 时，不显示指示器。
 *
 * @param props - 组件属性配置
 * @param props.indicator - 指示器配置（false 表示不显示，函数表示自定义渲染）
 * @param props.indicatorProps - 指示器属性配置（颜色、样式）
 * @param props.total - 轮播项总数
 * @param props.current - 当前激活的索引
 * @param props.activeColor - 激活状态的指示器颜色
 * @param props.inactiveColor - 非激活状态的指示器颜色
 * @param props.styles - 指示器样式对象
 *
 * @returns 渲染的指示器内容或 null
 */
export const CarouselIndicator = (props: CarouselIndicatorProps) => {
  const {
    indicator,
    indicatorProps,
    total,
    current,
    activeColor,
    inactiveColor,
    styles,
  } = props;

  if (indicator === false) return null;
  if (total <= 1) return null;

  if (typeof indicator === 'function') {
    return indicator(total, current);
  }

  const dotActiveColor = indicatorProps?.color ?? activeColor;

  return (
    <View style={[styles.indicatorContainer, indicatorProps?.style]}>
      {Array.from({ length: total }, (_, i) => {
        const isActive = i === current;
        return (
          <View
            key={i}
            style={[
              styles.indicatorDot,
              { backgroundColor: isActive ? dotActiveColor : inactiveColor },
              isActive && styles.indicatorDotActive,
            ]}
          />
        );
      })}
    </View>
  );
};
