import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { PopupFloatingPanelProps } from '../../Popup';
import type { ComponentSize } from '../../shares/types';
import type { TagDisplayProps } from '../../_internal/TagValueDisplay';
import type {
  PickerDisplayInputProps,
  PickerInputStyles,
} from '../../_internal/PickerTrigger';
import type {
  ListPickerDisplayMode,
  ListPickerStatus,
  ListPickerValue,
} from '../types';

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
