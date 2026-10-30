import type { ReactNode } from 'react';
import type { ActivityIndicatorProps, StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';

/**
 * Loading 的承载形态。
 * inline 行内、block 区块、more 列表底部、overlay 遮罩浮层。
 */
export type LoadingVariant = 'inline' | 'block' | 'more' | 'overlay';

/**
 * 转圈颜色语义。primary 主任务、muted 次级任务、inverse 实底容器内。
 */
export type LoadingTone = 'primary' | 'muted' | 'inverse';

export interface LoadingStyles {
  /** 转圈容器样式。只改对齐，不改颜色与尺寸。 */
  indicator?: StyleProp<ViewStyle>;

  /** 主文案样式。字号由 variant 决定。 */
  text?: StyleProp<TextStyle>;
}

export interface LoadingProps
  extends Omit<ActivityIndicatorProps, 'size' | 'style' | 'color'> {
  /** 转圈尺寸：small 16 / normal 20 / large 28。缺省按 variant 取默认档。 */
  size?: ComponentSize;

  /** 承载形态，默认 inline。 */
  variant?: LoadingVariant;

  /** 转圈颜色语义，默认 primary。 */
  tone?: LoadingTone;

  /** 主文案。只接字符串，需要富文本时用 description。 */
  text?: string;

  /** 副文案。只写进度或耗时，block 下位于主文案下方。 */
  description?: ReactNode;

  /** 自定义转圈。传了就不渲染 ActivityIndicator。 */
  indicator?: ReactNode;

  style?: StyleProp<ViewStyle>;

  styles?: LoadingStyles;
}
