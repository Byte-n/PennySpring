import type { ReactNode } from 'react';
import type {
  StyleProp,
  TextInputProps,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type { ComponentSize } from '../shares/types';

/**
 * Textarea 的校验展示状态。
 * 状态只负责视觉表达，不负责执行校验逻辑。
 */
export type TextareaStatus = 'default' | 'error' | 'warning' | 'success';

export interface TextareaStyles {
  /** Label 文本样式。 */
  label?: StyleProp<TextStyle>;

  /** 文本域外壳样式。 */
  field?: StyleProp<ViewStyle>;

  /** TextInput 文本样式。 */
  input?: StyleProp<TextStyle>;

  /** 底部说明与计数容器样式。 */
  footer?: StyleProp<ViewStyle>;

  /** 字数计数文本样式。 */
  count?: StyleProp<TextStyle>;
}

export interface TextareaProps
  extends Omit<TextInputProps, 'style' | 'editable' | 'multiline' | 'placeholder'> {
  /**
   * 文本域尺寸。
   * 使用组件库公共尺寸语义，默认值为 normal。
   */
  size?: ComponentSize;

  /**
   * 文本域状态。
   * 默认值为 default。
   */
  status?: TextareaStatus;

  /**
   * 字段标签文本。
   * 不得用 placeholder 替代 label。
   */
  labelText?: string;

  /**
   * 字段标签自定义节点。
   * 传入 null 时不渲染标签区域。
   * 传入 undefined 时回退到 labelText。
   */
  label?: ReactNode | null;

  /**
   * 输入为空时展示的提示文本。
   * 只能用于格式示例或输入提示，不得替代 label。
   */
  placeholder?: string;

  /**
   * 最小显示行数。
   * 只影响初始和最小高度，不限制输入内容。
   */
  minRows?: number;

  /**
   * 最大显示行数。
   * 超出后由 TextInput 内部滚动承载，不继续撑高布局。
   */
  maxRows?: number;

  /**
   * 是否展示字数计数。
   * 只负责展示，不负责限制输入。
   */
  showCount?: boolean;

  /**
   * 是否禁用输入。
   * 禁用后不可编辑。
   */
  disabled?: boolean;

  /**
   * 是否只读。
   * 只读状态下不可编辑，但仍保持可读性，不等同于 disabled。
   */
  readonly?: boolean;

  /**
   * 是否处于加载状态。
   * 用于异步校验或内容识别中的反馈展示。
   */
  loading?: boolean;

  /**
   * 根元素样式。
   * 只用于控制组件外层布局。
   */
  style?: StyleProp<ViewStyle>;

  /**
   * 内部插槽样式覆盖。
   * 只能覆盖声明过的稳定插槽。
   */
  styles?: TextareaStyles;
}
