import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';

/**
 * Empty 的承载形态。
 * inline 用于整页空态（无外框），boxed 用于卡片内空态（1px 虚线 + 12 圆角）。
 */
export type EmptyVariant = 'inline' | 'boxed';

export interface EmptyStyles {
  /** 图标底板容器样式。可改尺寸，不改背景色语义。 */
  iconContainer?: StyleProp<ViewStyle>;

  /** 标题文本样式。仅作用于内部渲染的标题。 */
  title?: StyleProp<TextStyle>;

  /** 说明文本样式。说明被提升为主行时同样生效。 */
  description?: StyleProp<TextStyle>;
}

export interface EmptyProps {
  /** Empty 尺寸，默认 normal。compact 下只影响图标与行高。 */
  size?: ComponentSize;

  /** 承载形态，默认 inline。 */
  variant?: EmptyVariant;

  /**
   * 行内形态：横向排列 32 底板 + 单行文案。
   * 不承载标题/说明分层，也不接受 action。
   */
  compact?: boolean;

  /**
   * 图标位。
   * 传 null 不渲染；缺省时渲染默认空态图标与圆形底板。
   */
  icon?: ReactNode | null;

  /** 标题节点。缺省时说明升为主行。 */
  title?: ReactNode | null;

  /** 标题文本，纯文本兜底。 */
  titleText?: string;

  /** 说明节点，最多两行。 */
  description?: ReactNode | null;

  /** 说明文本，纯文本兜底。 */
  descriptionText?: string;

  /** 操作位。只接一个操作，推荐 Button size="small"。 */
  action?: ReactNode;

  /** 根元素样式，只用于外层布局。 */
  style?: StyleProp<ViewStyle>;

  /** 内部插槽样式覆盖。 */
  styles?: EmptyStyles;
}
