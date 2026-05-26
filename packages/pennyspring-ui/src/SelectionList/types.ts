import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { DisplayInputProps, DisplayInputStyles } from '../DisplayInput';
import type { InputProps } from '../Input';
import type { PopupFloatingPanelProps } from '../Popup';
import type { ComponentSize } from '../shares/types';
import type { TagDisplayProps } from '../_internal/TagValueDisplay';

/**
 * SelectionList 的选择模式。
 * single 表示单选，multiple 表示多选。
 */
export type SelectionListMode = 'single' | 'multiple';

export type SelectionListDisplayMode = 'text' | 'tag';

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

export type SelectionListSelectedValue =
  | SelectionListValue
  | SelectionListValue[];

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

export interface SelectionListPopupStyles {
  /** 弹层容器样式。 */
  popup?: StyleProp<ViewStyle>;

  /** 分组标题样式。 */
  groupTitle?: StyleProp<TextStyle>;

  /** 选项容器样式。 */
  option?: StyleProp<ViewStyle>;

  /** 选项主文本样式。 */
  optionLabel?: StyleProp<TextStyle>;
}

export interface SelectionListStyles extends SelectionListPopupStyles {
  /** SelectionList 根节点样式。 */
  root?: StyleProp<ViewStyle>;

  /** DisplayInput 触发器插槽样式。 */
  displayInput?: DisplayInputStyles & {
    /** DisplayInput 根节点样式。 */
    root?: StyleProp<ViewStyle>;
  };

  /** Label 文本样式。 */
  label?: StyleProp<TextStyle>;

  /** 触发器 field 样式。 */
  field?: StyleProp<ViewStyle>;

  /** 选中值文本样式。 */
  value?: StyleProp<TextStyle>;

  /** placeholder 文本样式。 */
  placeholder?: StyleProp<TextStyle>;

  /** suffix 区域样式。 */
  suffix?: StyleProp<ViewStyle>;

  /** 辅助说明文本样式。 */
  helper?: StyleProp<TextStyle>;

  /** 错误说明文本样式。 */
  error?: StyleProp<TextStyle>;
}

export interface SelectionListTexts {
  /**
   * 弹层标题文本。
   */
  headerText?: string;

  /**
   * 关闭按钮文本。
   */
  closeText?: string;

  /**
   * 多选确认按钮文本。
   */
  confirmText?: string;

  /**
   * 搜索输入框 placeholder。
   */
  searchPlaceholder?: string;

  /**
   * 加载状态文本。
   */
  loadingText?: string;

  /**
   * 空状态文本。
   */
  emptyText?: string;
}

type SearchInputControlledKey =
  | 'clearable'
  | 'defaultValue'
  | 'disabled'
  | 'errorText'
  | 'helperText'
  | 'label'
  | 'loading'
  | 'onChangeText'
  | 'onClear'
  | 'placeholder'
  | 'readonly'
  | 'size'
  | 'status'
  | 'style'
  | 'styles'
  | 'value';

type SearchInputConfig = Omit<InputProps, SearchInputControlledKey>;

type FloatingPanelControlledKey =
  | 'children'
  | 'defaultOpen'
  | 'defaultValue'
  | 'footer'
  | 'header'
  | 'onCancel'
  | 'onChange'
  | 'onOpenChange'
  | 'open'
  | 'value';

type FloatingPanelConfig = Omit<
  PopupFloatingPanelProps,
  FloatingPanelControlledKey
>;

type PopupPanelOwnedKey =
  | 'cancel'
  | 'cancelText'
  | 'closeOnCancel'
  | 'closeOnOk'
  | 'footer'
  | 'header'
  | 'ok'
  | 'okDisabled'
  | 'okLoading'
  | 'okText'
  | 'onOk'
  | 'renderFooter'
  | 'renderHeader'
  | 'size'
  | 'style'
  | 'styles'
  | 'title'
  | 'titleText';

type PopupPanelConfig = Omit<FloatingPanelConfig, PopupPanelOwnedKey>;

export interface SelectionListPopupProps extends PopupPanelConfig {
  /**
   * SelectionList 尺寸。
   * 使用组件库公共尺寸语义，默认值为 normal。
   */
  size?: ComponentSize;

  /**
   * 选择模式。
   * 默认值为 single。
   */
  mode?: SelectionListMode;

  /**
   * 当前选中值。
   * single 模式使用单个值，multiple 模式使用数组。
   */
  value?: SelectionListSelectedValue;

  /**
   * 默认选中值。
   * 仅用于非受控选择。
   */
  defaultValue?: SelectionListSelectedValue;

  /**
   * 选中值变化时触发。
   * 组件只返回值，不返回业务对象。
   */
  onChange?: (value: SelectionListSelectedValue) => void;

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
   * 内部文本配置。组件不提供默认展示文案，未传入时对应文本不展示。
   */
  texts?: SelectionListTexts;

  /**
   * 搜索输入框的非受控内部属性。
   * value、placeholder、状态和样式由 SelectionList 统一管理。
   */
  searchInputProps?: SearchInputConfig;

  /**
   * 内部 FloatingPanel 的配置。
   * open、value、onChange 等受控状态由 SelectionList 统一管理。
   */
  floatingPanelProps?: FloatingPanelConfig;

  /**
   * 弹层内容样式。
   * 只用于控制 Popup body 内容布局。
   */
  style?: StyleProp<ViewStyle>;

  /**
   * 内部插槽样式覆盖。
   * 只能覆盖声明过的稳定插槽。
   */
  styles?: SelectionListPopupStyles;
}

type DisplayInputConfig = Omit<
  DisplayInputProps,
  | 'children'
  | 'disabled'
  | 'label'
  | 'onPress'
  | 'placeholder'
  | 'readonly'
  | 'size'
  | 'status'
  | 'style'
  | 'styles'
  | 'valueText'
>;

type RootControlledPopupKey =
  | 'defaultOpen'
  | 'defaultValue'
  | 'disabled'
  | 'groups'
  | 'loading'
  | 'mode'
  | 'onChange'
  | 'onOpenChange'
  | 'open'
  | 'options'
  | 'readonly'
  | 'size'
  | 'value';

type PopupConfig = Omit<SelectionListPopupProps, RootControlledPopupKey>;

export interface SelectionListProps
  extends Omit<SelectionListPopupProps, 'style' | 'styles'> {
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

  displayMode?: SelectionListDisplayMode;

  /**
   * DisplayInput 触发器的非样式配置。
   * 样式能力统一通过 styles.displayInput 提供。
   */
  displayInputProps?: DisplayInputConfig;

  /**
   * 弹层专属配置。
   * open、value、options 等由 SelectionList 根组件统一控制。
   */
  popupProps?: PopupConfig;

  tagProps?: TagDisplayProps;

  /**
   * 内部插槽样式覆盖。
   */
  styles?: SelectionListStyles;

  /**
   * SelectionList 根节点样式。
   */
  style?: StyleProp<ViewStyle>;
}
