import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';

/**
 * SelectionList 的尺寸。
 */
export type SelectionListSize = ComponentSize;

/**
 * SelectionList 的选择模式。
 * single 表示单选，multiple 表示多选。
 */
export type SelectionListMode = 'single' | 'multiple';

/**
 * SelectionList 的校验展示状态。
 * 状态只负责视觉和可访问性表达，不负责执行校验逻辑。
 */
export type SelectionListStatus = 'default' | 'error' | 'warning' | 'success';

/**
 * SelectionList 的选项值。
 * 只允许稳定的字符串或数字，避免对象引用造成选中判断不稳定。
 */
export type SelectionListValue = string | number;

export interface SelectionListOption {
  /**
   * 选项唯一值。
   * 同一个 SelectionList 内必须唯一。
   */
  value: SelectionListValue;

  /**
   * 选项主文本。
   * 由组件内部渲染为 Text。
   */
  labelText?: string;

  /**
   * 选项主内容自定义节点。
   * 传入后由外部完全控制节点渲染。
   */
  label?: ReactNode;

  /**
   * 选项辅助文本。
   * 由组件内部渲染为 Text。
   */
  descriptionText?: string;

  /**
   * 选项辅助内容自定义节点。
   * 传入后由外部完全控制节点渲染。
   */
  description?: ReactNode;

  /**
   * 选项左侧识别元素。
   * 用于图标、头像或分类标记。
   */
  prefix?: ReactNode;

  /**
   * 选项右侧辅助元素。
   * 用于状态、数量或自定义操作提示。
   */
  suffix?: ReactNode;

  /**
   * 是否禁用该选项。
   * 禁用选项不可选择，但仍可展示。
   */
  disabled?: boolean;
}

export interface SelectionListOptionGroup {
  /**
   * 分组唯一标识。
   * 用于列表 key 和展开状态关联。
   */
  key: string;

  /**
   * 分组标题文本。
   * 由组件内部渲染为 Text。
   */
  titleText?: string;

  /**
   * 分组标题自定义节点。
   * 传入后由外部完全控制节点渲染。
   */
  title?: ReactNode;

  /**
   * 分组内选项。
   */
  options: SelectionListOption[];
}

export interface SelectionListStyles {
  /** Label 文本样式。 */
  label?: StyleProp<TextStyle>;

  /** 触发器外壳样式。 */
  trigger?: StyleProp<ViewStyle>;

  /** 选中值文本样式。 */
  valueText?: StyleProp<TextStyle>;

  /** placeholder 文本样式。 */
  placeholder?: StyleProp<TextStyle>;

  /** 弹层容器样式。 */
  popup?: StyleProp<ViewStyle>;

  /** 分组标题样式。 */
  groupTitle?: StyleProp<TextStyle>;

  /** 选项容器样式。 */
  option?: StyleProp<ViewStyle>;

  /** 选项主文本样式。 */
  optionLabel?: StyleProp<TextStyle>;

  /** 辅助说明文本样式。 */
  helper?: StyleProp<TextStyle>;

  /** 错误说明文本样式。 */
  error?: StyleProp<TextStyle>;
}

export interface SelectionListPopupProps {
  /**
   * SelectionList 尺寸。
   * 使用组件库公共尺寸语义，默认值为 normal。
   */
  size?: SelectionListSize;

  /**
   * 选择模式。
   * 默认值为 single。
   */
  mode?: SelectionListMode;

  /**
   * 当前选中值。
   * single 模式使用单个值，multiple 模式使用数组。
   */
  value?: SelectionListValue | SelectionListValue[];

  /**
   * 默认选中值。
   * 仅用于非受控选择。
   */
  defaultValue?: SelectionListValue | SelectionListValue[];

  /**
   * 选中值变化时触发。
   * 组件只返回值，不返回业务对象。
   */
  onChange?: (value: SelectionListValue | SelectionListValue[]) => void;

  /**
   * 扁平选项列表。
   * 与 groups 二选一使用。
   */
  options?: SelectionListOption[];

  /**
   * 分组选项列表。
   * 与 options 二选一使用。
   */
  groups?: SelectionListOptionGroup[];

  /**
   * 是否展开。
   * 传入后 SelectionList 展开状态由调用方控制。
   */
  open?: boolean;

  /**
   * 默认是否展开。
   * 仅用于非受控展开。
   */
  defaultOpen?: boolean;

  /**
   * 展开状态变化时触发。
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * 是否支持搜索。
   * 只展示搜索入口，不负责远程请求。
   */
  searchable?: boolean;

  /**
   * 当前搜索文本。
   * 传入后搜索文本由调用方控制。
   */
  searchValue?: string;

  /**
   * 搜索文本变化时触发。
   */
  onSearchChange?: (value: string) => void;

  /**
   * 是否禁用 SelectionList。
   * 禁用后不可展开，并暴露 disabled 可访问状态。
   */
  disabled?: boolean;

  /**
   * 是否只读。
   * 只读状态下不可展开，但仍保持可读性。
   */
  readonly?: boolean;

  /**
   * 是否处于加载状态。
   * 用于选项加载中的反馈展示。
   */
  loading?: boolean;

  /**
   * 空状态内容。
   * 用于无选项或搜索无结果场景。
   */
  empty?: ReactNode;

  /**
   * 弹层内容样式。
   * 只用于控制 Popup 外层布局。
   */
  style?: StyleProp<ViewStyle>;

  /**
   * 内部插槽样式覆盖。
   * 只能覆盖声明过的稳定插槽。
   */
  styles?: SelectionListStyles;
}

export interface SelectionListProps extends SelectionListPopupProps {
  /**
   * SelectionList 状态。
   * error 状态会优先展示 errorText。
   */
  status?: SelectionListStatus;

  /**
   * 字段标签文本。
   * 由组件内部渲染为 Text，不得用 placeholder 替代。
   */
  labelText?: string;

  /**
   * 字段标签自定义节点。
   * 传入后由外部完全控制节点渲染。
   */
  label?: ReactNode;

  /**
   * 未选择时展示的提示文本。
   * 只能用于选择提示，不得替代 label。
   */
  placeholder?: string;

  /**
   * 辅助说明文本。
   * 当 status 为 error 且 errorText 存在时，优先展示 errorText。
   */
  helperText?: ReactNode;

  /**
   * 错误说明文本。
   * 只负责展示错误，不负责执行校验。
   */
  errorText?: ReactNode;

}
