import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

/**
 * 字段类控件的公开样式契约。
 * DisplayInput 与所有触发器类组件共用，组件内部实现向该契约适配，
 * 调用方无需感知底层实现组件的槽位结构。
 */
export interface FieldSlotStyles {
  label?: StyleProp<TextStyle>;
  field?: StyleProp<ViewStyle>;
  underline?: StyleProp<ViewStyle>;
  valueContainer?: StyleProp<ViewStyle>;
  value?: StyleProp<TextStyle>;
  prefix?: StyleProp<ViewStyle>;
  suffix?: StyleProp<ViewStyle>;
}

/** 触发器额外暴露根节点槽位。 */
export interface TriggerFieldStyles extends FieldSlotStyles {
  root?: StyleProp<ViewStyle>;
}

/** 浮层容器的公开样式契约。 */
export interface PickerPopupStyleSlots {
  root?: StyleProp<ViewStyle>;
  mask?: StyleProp<ViewStyle>;
  container?: StyleProp<ViewStyle>;
  content?: StyleProp<ViewStyle>;
  handle?: StyleProp<ViewStyle>;
  handleIndicator?: StyleProp<ViewStyle>;
}

export interface PickerHeaderStyleSlots {
  cancelButton?: StyleProp<ViewStyle>;
  cancelText?: StyleProp<TextStyle>;
  titleContainer?: StyleProp<ViewStyle>;
  titleText?: StyleProp<TextStyle>;
  okButton?: StyleProp<ViewStyle>;
  okText?: StyleProp<TextStyle>;
}

/** 面板主体的扁平槽位，不暴露内部视图层级。 */
export interface PickerBodyStyleSlots {
  root?: StyleProp<ViewStyle>;
  column?: StyleProp<ViewStyle>;
  item?: StyleProp<ViewStyle>;
  itemText?: StyleProp<TextStyle>;
  indicator?: StyleProp<ViewStyle>;
  loading?: StyleProp<ViewStyle>;
  empty?: StyleProp<ViewStyle>;
}

export interface PickerPanelStyleSlots {
  root?: StyleProp<ViewStyle>;
  header?: PickerHeaderStyleSlots;
  body?: PickerBodyStyleSlots;
  safeArea?: StyleProp<ViewStyle>;
}
