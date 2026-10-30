import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { IconComponent, IconName } from '../Icon';
import type { InputStatus } from '../Input';
import type { PopupFloatingPanelProps } from '../Popup';
import type { ComponentSize } from '../shares/types';
import type { TagDisplayProps } from '../_internal/TagValueDisplay';
import type { PickerDisplayInputProps } from '../_internal/PickerTrigger';
import type { TriggerFieldStyles } from '../shares/pickerStyles';

export type TagPickerValue = string | number;

export interface TagPickerOption {
  /** 选项唯一值，同一次选择内必须唯一。 */
  value: TagPickerValue;

  /** 选项文本，由组件内部渲染为 Text 并单行截断。 */
  labelText?: string;

  /** 选项自定义节点；传入后由外部完全控制渲染，传 null 不渲染。 */
  label?: ReactNode | null;

  /** 选项前置图标。 */
  icon?: IconName | IconComponent;

  /** 是否禁用该选项。 */
  disabled?: boolean;

  /**
   * 隐藏选项。
   * 默认分组不展示，仅在选中时归入隐藏分组。
   */
  hidden?: boolean;
}

export interface TagPickerTexts {
  /** 默认分组标题，展示时自动附加选项数量。 */
  optionsTitle?: string;

  /** 隐藏分组标题，展示时自动附加选项数量。 */
  hiddenOptionsTitle?: string;

  /** 加载态文本。 */
  loadingText?: string;

  /** 空态文本。 */
  emptyText?: string;
}

export type TagPickerFloatingPanelConfig = Omit<
  PopupFloatingPanelProps,
  | 'bodyScrollable'
  | 'children'
  | 'defaultOpen'
  | 'defaultValue'
  | 'footer'
  | 'onCancel'
  | 'onChange'
  | 'onOpenChange'
  | 'open'
  | 'renderFooter'
  | 'size'
  | 'style'
  | 'styles'
  | 'value'
>;

export interface TagPickerStyles {
  /** 触发器槽位样式，root 对应 DisplayInput 根节点。 */
  input?: TriggerFieldStyles;

  /** 弹层容器样式。 */
  panel?: StyleProp<ViewStyle>;

  /** chips 容器样式。 */
  chips?: StyleProp<ViewStyle>;

  /** 选项文本样式。 */
  optionLabel?: StyleProp<TextStyle>;
}

export interface TagPickerProps {
  options: TagPickerOption[];

  /** 当前选中值。 */
  value?: TagPickerValue[];

  /** 默认选中值，仅用于非受控。 */
  defaultValue?: TagPickerValue[];

  /** 选中值变化时触发。 */
  onChange?: (value: TagPickerValue[]) => void;

  /** 是否禁用整个选择器。 */
  disabled?: boolean;

  /** 是否只读；只读不可展开或移除已选标签，但保持正常可读性。 */
  readonly?: boolean;

  /** 校验展示状态。 */
  status?: InputStatus;

  /** 是否展示清除按钮；清除后回传空数组。 */
  allowClear?: boolean;

  /** 清除全部已选值后触发。 */
  onClear?: () => void;

  /** 是否处于加载态。 */
  loading?: boolean;

  /** 组件尺寸。 */
  size?: ComponentSize;

  /** 触发器字段标签文本。 */
  labelText?: string;

  /** 无标签且未选择时展示的提示文本。 */
  placeholder?: string;

  /** 是否展开，传入后由调用方控制。 */
  open?: boolean;

  /** 默认是否展开，仅用于非受控。 */
  defaultOpen?: boolean;

  /** 展开状态变化时触发。 */
  onOpenChange?: (open: boolean) => void;

  /** 内部文本配置。组件不提供默认文案。 */
  texts?: TagPickerTexts;

  /** 触发器内已选标签的展示配置。 */
  tagProps?: TagDisplayProps;

  /** 触发器 DisplayInput 的非受控配置。 */
  displayInputProps?: PickerDisplayInputProps;

  /** 内部 FloatingPanel 的非受控配置。 */
  floatingPanelProps?: TagPickerFloatingPanelConfig;

  /** 触发器根节点样式。 */
  style?: StyleProp<ViewStyle>;

  /** 内部插槽样式覆盖。 */
  styles?: TagPickerStyles;
}
