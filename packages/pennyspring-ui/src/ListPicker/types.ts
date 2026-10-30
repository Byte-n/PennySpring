import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { InputProps } from '../Input';
import type { PopupFloatingPanelProps } from '../Popup';
import type { ComponentSize } from '../shares/types';
import type { TagDisplayProps } from '../_internal/TagValueDisplay';
import type {
  PickerDisplayInputProps,
  PickerInputStyles,
} from '../_internal/PickerTrigger';

/**
 * ListPicker 的选择模式。
 * single 表示单选，multiple 表示多选。
 */
export type ListPickerMode = 'single' | 'multiple';

export type ListPickerDisplayMode = 'text' | 'tag';

/**
 * ListPicker 的校验展示状态。
 * 状态只负责视觉和可访问性表达，不负责执行校验逻辑。
 */
export type ListPickerStatus = 'default' | 'error' | 'warning' | 'success';

/**
 * ListPicker 的选项值。
 * 只允许稳定的字符串或数字，避免对象引用造成选中判断不稳定。
 */
export type ListPickerValue = string | number;

export type ListPickerSelectedValue =
  | ListPickerValue
  | ListPickerValue[];

export interface ListPickerOption {
  /**
   * 选项唯一值。
   * 同一个 ListPicker 内必须唯一。
   */
  value: ListPickerValue;

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

export interface ListPickerOptionGroup {
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
  options: ListPickerOption[];
}

export interface ListPickerPopupStyles {
  /** 弹层容器样式。 */
  popup?: StyleProp<ViewStyle>;

  /** 分组标题样式。 */
  groupTitle?: StyleProp<TextStyle>;

  /** 选项容器样式。 */
  option?: StyleProp<ViewStyle>;

  /** 选项主文本样式。 */
  optionLabel?: StyleProp<TextStyle>;
}

export interface ListPickerStyles extends ListPickerPopupStyles {
  /** 触发器槽位样式，root 对应 DisplayInput 根节点。 */
  input?: PickerInputStyles;
}

export interface ListPickerTexts {
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
   * 搜索输入框标签文本。
   * 搜索输入框必须通过标签表达字段语义，不得只依赖 placeholder。
   */
  searchLabelText?: string;

  /**
   * 搜索输入框 placeholder。
   * 与 searchLabelText 同时传入时，文案不得重复。
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
  | 'label'
  | 'labelText'
  | 'loading'
  | 'onChange'
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

export interface ListPickerPopupProps extends PopupPanelConfig {
  /**
   * ListPicker 尺寸。
   * 使用组件库公共尺寸语义，默认值为 normal。
   */
  size?: ComponentSize;

  /**
   * 选择模式。
   * 默认值为 single。
   */
  mode?: ListPickerMode;

  /**
   * 当前选中值。
   * single 模式使用单个值，multiple 模式使用数组。
   */
  value?: ListPickerSelectedValue;

  /**
   * 默认选中值。
   * 仅用于非受控选择。
   */
  defaultValue?: ListPickerSelectedValue;

  /**
   * 选中值变化时触发。
   * 组件只返回值，不返回业务对象。
   */
  onChange?: (value: ListPickerSelectedValue) => void;

  /**
   * 扁平选项列表。
   * 与 groups 二选一使用。
   */
  options?: ListPickerOption[];

  /**
   * 分组选项列表。
   * 与 options 二选一使用。
   */
  groups?: ListPickerOptionGroup[];

  /**
   * 是否展开。
   * 传入后 ListPicker 展开状态由调用方控制。
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
   * 是否禁用 ListPicker。
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
  texts?: ListPickerTexts;

  /**
   * 搜索输入框的非受控内部属性。
   * value、placeholder、状态和样式由 ListPicker 统一管理。
   */
  searchInputProps?: SearchInputConfig;

  /**
   * 内部 FloatingPanel 的配置。
   * open、value、onChange 等受控状态由 ListPicker 统一管理。
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
  styles?: ListPickerPopupStyles;
}

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

type PopupConfig = Omit<ListPickerPopupProps, RootControlledPopupKey>;

export interface ListPickerProps
  extends Omit<ListPickerPopupProps, 'style' | 'styles'> {
  /**
   * ListPicker 状态。
   */
  status?: ListPickerStatus;

  /**
   * 是否展示清除按钮。
   * 清除后多选回传空数组，单选回传 undefined。
   */
  allowClear?: boolean;

  /**
   * 清除选中值后触发。
   */
  onClear?: () => void;

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

  displayMode?: ListPickerDisplayMode;

  /**
   * DisplayInput 触发器的非样式配置。
   * 样式能力统一通过 styles.input 提供。
   */
  displayInputProps?: PickerDisplayInputProps;

  /**
   * 弹层专属配置。
   * open、value、options 等由 ListPicker 根组件统一控制。
   */
  popupProps?: PopupConfig;

  tagProps?: TagDisplayProps;

  /**
   * DisplayInput 根节点样式。
   */
  style?: StyleProp<ViewStyle>;

  /**
   * 内部插槽样式覆盖。
   */
  styles?: ListPickerStyles;
}

export type ListPickerCascaderValue = ListPickerValue[];

export interface ListPickerCascaderOption<TData = unknown> {
  /** 选项唯一值。同一层级内必须唯一。 */
  value: ListPickerValue;

  /** 选项主文本，由组件内部渲染为 Text。 */
  labelText?: string;

  /** 选项主内容自定义节点。 */
  label?: ReactNode;

  /** 选项辅助文本，由组件内部渲染为 Text。 */
  descriptionText?: string;

  /** 选项辅助内容自定义节点。 */
  description?: ReactNode;

  /** 选项左侧识别元素。 */
  prefix?: ReactNode;

  /** 选项右侧辅助元素。 */
  suffix?: ReactNode;

  /** 是否禁用该选项。 */
  disabled?: boolean;

  /** 下一层选项。为空或未设置时视为叶子节点。 */
  children?: Array<ListPickerCascaderOption<TData>>;

  /** 业务数据。 */
  data?: TData;
}

export interface ListPickerCascaderSelectParams<TData = unknown> {
  reason: 'select';
  option: ListPickerCascaderOption<TData>;
  value: ListPickerValue;
  level: number;
  optionIndex: number;
  path: Array<ListPickerCascaderOption<TData>>;
  items: Array<ListPickerCascaderOption<TData> | undefined>;
  isLeaf: boolean;
}

export interface ListPickerCascaderRemoveParams<TData = unknown> {
  reason: 'remove';
  option: ListPickerCascaderOption<TData>;
  value: ListPickerValue;
  level: number;
  optionIndex: number;
  path: Array<ListPickerCascaderOption<TData>>;
  items: Array<ListPickerCascaderOption<TData> | undefined>;
  isLeaf: boolean;
}

export interface ListPickerCascaderClearParams {
  reason: 'clear';
  path: [];
  items: [];
}

export type ListPickerCascaderChangeParams<TData = unknown> =
  | ListPickerCascaderSelectParams<TData>
  | ListPickerCascaderRemoveParams<TData>
  | ListPickerCascaderClearParams;

export type ListPickerCascaderOpenChangeReason =
  | 'trigger'
  | 'select'
  | 'cancel';

export interface ListPickerCascaderOpenChangeParams {
  reason: ListPickerCascaderOpenChangeReason;
}

export interface ListPickerCascaderTabsStyles {
  tabList?: StyleProp<ViewStyle>;
  tab?: StyleProp<ViewStyle>;
  tabActive?: StyleProp<ViewStyle>;
  label?: StyleProp<TextStyle>;
  labelActive?: StyleProp<TextStyle>;
}

export interface ListPickerCascaderStyles {
  /** 触发器槽位，root 对应 DisplayInput 根节点。 */
  input?: PickerInputStyles;

  /** 浮层内容容器。 */
  popup?: StyleProp<ViewStyle>;

  /** 层级 Tab。 */
  tabs?: ListPickerCascaderTabsStyles;

  /** 选项容器。 */
  option?: StyleProp<ViewStyle>;

  /** 选项主文本。 */
  optionLabel?: StyleProp<TextStyle>;

  /** 空态。 */
  empty?: StyleProp<ViewStyle>;

  /** 加载态。 */
  loading?: StyleProp<ViewStyle>;
}

export interface ListPickerCascaderTexts {
  /** 浮层标题文本。 */
  headerText?: string;

  /** 关闭按钮文本。 */
  closeText?: string;

  /** 层级 Tab 未选择时的占位文本。 */
  tabPlaceholderText?: string;

  /** 空状态文本。 */
  emptyText?: string;

  /** 加载状态文本。 */
  loadingText?: string;
}

type PopupControlledKey =
  | 'bodyScrollable'
  | 'cancel'
  | 'cancelText'
  | 'children'
  | 'closeOnCancel'
  | 'closeOnOk'
  | 'defaultOpen'
  | 'footer'
  | 'header'
  | 'ok'
  | 'okDisabled'
  | 'okLoading'
  | 'okText'
  | 'onCancel'
  | 'onOk'
  | 'onOpenChange'
  | 'open'
  | 'renderFooter'
  | 'renderHeader'
  | 'size'
  | 'title'
  | 'titleText';

export type ListPickerCascaderPopupConfig = Omit<
  PopupFloatingPanelProps,
  PopupControlledKey
>;

export interface ListPickerCascaderProps<TData = unknown> {
  /** 组件尺寸。 */
  size?: ComponentSize;

  /** 树形选项。 */
  options: Array<ListPickerCascaderOption<TData>>;

  /** 当前选中路径。 */
  value?: ListPickerCascaderValue;

  /** 默认选中路径。 */
  defaultValue?: ListPickerCascaderValue;

  /** 选中路径变化时触发。 */
  onChange?: (
    value: ListPickerCascaderValue,
    params: ListPickerCascaderChangeParams<TData>,
  ) => void;

  /** 是否展开。 */
  open?: boolean;

  /** 默认是否展开。 */
  defaultOpen?: boolean;

  /** 展开状态变化时触发。 */
  onOpenChange?: (
    open: boolean,
    params: ListPickerCascaderOpenChangeParams,
  ) => void;

  /** 取消动作回调。 */
  onCancel?: () => void;

  /** 当前层级。 */
  activeLevel?: number;

  /** 默认层级。 */
  defaultActiveLevel?: number;

  /** 层级变化时触发。 */
  onActiveLevelChange?: (level: number) => void;

  /** 选中叶子后是否关闭浮层。默认 true。 */
  closeOnSelectLeaf?: boolean;

  /** 是否展示清除按钮。 */
  allowClear?: boolean;

  /** 清除选中值后触发。 */
  onClear?: () => void;

  /** 校验展示状态。 */
  status?: ListPickerStatus;

  /** 字段标签文本。 */
  labelText?: string;

  /** 字段标签自定义节点。 */
  label?: ReactNode;

  /** 是否禁用。 */
  disabled?: boolean;

  /** 是否只读。 */
  readonly?: boolean;

  /** 是否处于加载状态。 */
  loading?: boolean;

  /** 空状态内容。 */
  empty?: ReactNode;

  /** 触发器展示模式。 */
  displayMode?: ListPickerDisplayMode;

  /** DisplayInput 触发器的非样式配置。 */
  displayInputProps?: PickerDisplayInputProps;

  /** Tag 展示配置。 */
  tagProps?: TagDisplayProps;

  /** 内部文本配置。 */
  texts?: ListPickerCascaderTexts;

  /** 自定义选项标签。 */
  renderOptionLabel?: (
    option: ListPickerCascaderOption<TData>,
    level: number,
    optionIndex: number,
  ) => ReactNode;

  /** 内部 FloatingPanel 配置。 */
  popupProps?: ListPickerCascaderPopupConfig;

  /** DisplayInput 根节点样式。 */
  style?: StyleProp<ViewStyle>;

  /** 内部插槽样式覆盖。 */
  styles?: ListPickerCascaderStyles;
}
