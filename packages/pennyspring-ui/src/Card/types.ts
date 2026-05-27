import type { ReactNode } from 'react';
import type {
  GestureResponderEvent,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type { ComponentSize } from '../shares/types';

/**
 * Card 的视觉变体。
 * plain 用于普通容器，elevated 用于更高层级，summary 用于摘要信息。
 */
export type CardVariant = 'plain' | 'elevated' | 'summary';
export type CardTitleNode = Exclude<ReactNode, string | number | boolean>;

export interface CardStyles {
  /** 标题区容器样式。 */
  header?: StyleProp<ViewStyle>;

  /** 标题文本样式。仅作用于 titleText 渲染出的内部文本。 */
  titleText?: StyleProp<TextStyle>;

  /** 标题区右侧容器样式。 */
  extra?: StyleProp<ViewStyle>;

  /** 主体内容容器样式。 */
  body?: StyleProp<ViewStyle>;

  /** 底部内容容器样式。 */
  footer?: StyleProp<ViewStyle>;
}

export interface CardProps {
  /**
   * Card 尺寸。
   * 使用组件库公共尺寸语义，默认值为 normal。
   */
  size?: ComponentSize;

  /**
   * Card 视觉变体。
   * 默认值为 plain。
   */
  variant?: CardVariant;

  /**
   * Card 标题文本。
   * 由组件内部渲染为 Text。
   */
  titleText?: string;

  /**
   * Card 标题自定义节点。
   * 传入后由外部完全控制节点渲染。
   */
  title?: CardTitleNode | null;

  /**
   * Card 标题区右侧内容。
   * 用于操作入口、状态或更多按钮。
   */
  extra?: ReactNode;

  /**
   * Card 底部内容。
   * 用于次级操作或补充信息。
   */
  footer?: ReactNode;

  /**
   * Card 主体内容。
   */
  children?: ReactNode;

  /**
   * 点击 Card 时触发。
   * 传入后根节点使用 Pressable，并展示 pressed 状态。
   */
  onPress?: (event: GestureResponderEvent) => void;

  /**
   * 是否禁用点击。
   * 仅当 onPress 存在时生效。
   */
  disabled?: boolean;

  /**
   * 是否处于加载状态。
   * 用于主体内容加载中的反馈展示。
   */
  loading?: boolean;

  /**
   * 加载状态下的主体替换内容。
   * loading 为 true 且 loadingNode 存在时，Body 渲染 loadingNode 而不是 children。
   */
  loadingNode?: ReactNode;

  /**
   * 根元素样式。
   * 只用于控制组件外层布局，不得作为外边距约定。
   */
  style?: StyleProp<ViewStyle>;

  /**
   * 内部插槽样式覆盖。
   * 只能覆盖声明过的稳定插槽。
   */
  styles?: CardStyles;
}
