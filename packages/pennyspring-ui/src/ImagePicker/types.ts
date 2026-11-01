import type { ReactNode } from 'react';
import type { ImageStyle, StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { InputStatus } from '../Input';
import type { ComponentSize } from '../shares/types';
import type { PickerDisplayInputProps } from '../_internal/PickerTrigger';
import type { TriggerFieldStyles } from '../shares/pickerStyles';

export type ImagePickerSource = 'camera' | 'photo' | 'fileSystem';

export type ImagePickerImageQuality =
  0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1;

export interface ImagePickerValue {
  uri: string;
  /** 展示远程图片时附带的请求头；不参与持久化。 */
  headers?: Record<string, string>;
  fileName?: string;
  fileSize?: number;
  height?: number;
  mimeType?: string;
  name?: string;
  type?: string;
  width?: number;
  /** 图片的 base64 内容；仅在 includeBase64 开启时由原生选择器返回。 */
  base64?: string;
}

export interface ImagePickerOpenChangeParams {
  reason: 'trigger' | 'action' | 'cancel';
}

export interface ImagePickerPickOptions {
  maxCount: number;
  multiple: boolean;
  includeBase64?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  quality?: ImagePickerImageQuality;
}

export interface ImagePickerStyles {
  /** 触发器槽位样式，root 对应 DisplayInput 根节点。 */
  input?: TriggerFieldStyles;
  popup?: StyleProp<ViewStyle>;
  popupHeader?: StyleProp<ViewStyle>;
  popupTitleArea?: StyleProp<ViewStyle>;
  popupTitle?: StyleProp<TextStyle>;
  popupSubtitle?: StyleProp<TextStyle>;
  popupActions?: StyleProp<ViewStyle>;
  popupBody?: StyleProp<ViewStyle>;
  imageGrid?: StyleProp<ViewStyle>;
  imageItem?: StyleProp<ViewStyle>;
  image?: StyleProp<ImageStyle>;
  imageError?: StyleProp<ViewStyle>;
  removeButton?: StyleProp<ViewStyle>;
  empty?: StyleProp<ViewStyle>;
  emptyText?: StyleProp<TextStyle>;
}

export type ImagePickerSelectedValue = ImagePickerValue | ImagePickerValue[];

export type ImagePickerDisplayInputProps = PickerDisplayInputProps;

interface ImagePickerBaseProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, params: ImagePickerOpenChangeParams) => void;
  onError?: (error: unknown) => void;
  readonly?: boolean;
  disabled?: boolean;
  size?: ComponentSize;
  status?: InputStatus;
  allowClear?: boolean;
  onClear?: () => void;
  label?: ReactNode | null;
  labelText?: string;
  /** 无标签且未选择时展示的提示文本。 */
  placeholder?: string;
  displayInputProps?: ImagePickerDisplayInputProps;
  cameraText?: string;
  photoText?: string;
  fileSystemText?: string;
  cancelText?: string;
  okText?: string;
  titleText?: string;
  multipleHintText?: string;
  emptyText?: string;
  sources?: ImagePickerSource[];
  selectedText?: string;
  unselectedText?: string;
  maxCount?: number;
  /** 是否让原生选择器返回 base64 内容，默认关闭。 */
  includeBase64?: boolean;
  /** 选择后压缩的最长边宽度。 */
  maxWidth?: number;
  /** 选择后压缩的最长边高度。 */
  maxHeight?: number;
  /** 选择后压缩质量，取值 0 - 1。 */
  quality?: ImagePickerImageQuality;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: ImagePickerStyles;
}

export interface ImagePickerSingleProps extends ImagePickerBaseProps {
  multiple?: false;
  value?: ImagePickerValue;
  defaultValue?: ImagePickerValue;
  onChange?: (value: ImagePickerValue) => void;
}

export interface ImagePickerMultipleProps extends ImagePickerBaseProps {
  multiple: true;
  value?: ImagePickerValue[];
  defaultValue?: ImagePickerValue[];
  onChange?: (value: ImagePickerValue[]) => void;
}

export type ImagePickerProps =
  ImagePickerSingleProps | ImagePickerMultipleProps;

export interface ImagePickerPopupBaseProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, params: ImagePickerOpenChangeParams) => void;
  onError?: (error: unknown) => void;
  readonly?: boolean;
  disabled?: boolean;
  cameraText?: string;
  photoText?: string;
  fileSystemText?: string;
  cancelText?: string;
  okText?: string;
  titleText?: string;
  multipleHintText?: string;
  emptyText?: string;
  sources?: ImagePickerSource[];
  selectedText?: string;
  unselectedText?: string;
  maxCount?: number;
  /** 是否让原生选择器返回 base64 内容，默认关闭。 */
  includeBase64?: boolean;
  /** 选择后压缩的最长边宽度。 */
  maxWidth?: number;
  /** 选择后压缩的最长边高度。 */
  maxHeight?: number;
  /** 选择后压缩质量，取值 0 - 1。 */
  quality?: ImagePickerImageQuality;
  style?: StyleProp<ViewStyle>;
  styles?: ImagePickerStyles;
}

export interface ImagePickerPopupSingleProps extends ImagePickerPopupBaseProps {
  multiple?: false;
  value?: ImagePickerValue;
  defaultValue?: ImagePickerValue;
  onChange?: (value: ImagePickerValue) => void;
}

export interface ImagePickerPopupMultipleProps extends ImagePickerPopupBaseProps {
  multiple: true;
  value?: ImagePickerValue[];
  defaultValue?: ImagePickerValue[];
  onChange?: (value: ImagePickerValue[]) => void;
}

export type ImagePickerPopupProps =
  ImagePickerPopupSingleProps | ImagePickerPopupMultipleProps;

export interface ImagePickerActionSheetBaseProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, params: ImagePickerOpenChangeParams) => void;
  onError?: (error: unknown) => void;
  cameraText?: string;
  photoText?: string;
  fileSystemText?: string;
  cancelText?: string;
  titleText?: string;
  sources?: ImagePickerSource[];
  maxCount?: number;
  /** 是否让原生选择器返回 base64 内容，默认关闭。 */
  includeBase64?: boolean;
  /** 选择后压缩的最长边宽度。 */
  maxWidth?: number;
  /** 选择后压缩的最长边高度。 */
  maxHeight?: number;
  /** 选择后压缩质量，取值 0 - 1。 */
  quality?: ImagePickerImageQuality;
}

export interface ImagePickerActionSheetSingleProps extends ImagePickerActionSheetBaseProps {
  multiple?: false;
  value?: ImagePickerValue;
  defaultValue?: ImagePickerValue;
  onChange?: (value: ImagePickerValue) => void;
}

export interface ImagePickerActionSheetMultipleProps extends ImagePickerActionSheetBaseProps {
  multiple: true;
  value?: ImagePickerValue[];
  defaultValue?: ImagePickerValue[];
  onChange?: (value: ImagePickerValue[]) => void;
}

export type ImagePickerActionSheetProps =
  ImagePickerActionSheetSingleProps | ImagePickerActionSheetMultipleProps;
