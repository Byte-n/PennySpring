import type { ReactNode } from 'react';
import type {
  ImageStyle,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type { DisplayInputProps } from '../DisplayInput';

export type ImagePickerSource = 'camera' | 'photo' | 'fileSystem';

export interface ImagePickerValue {
  uri: string;
  fileName?: string;
  fileSize?: number;
  height?: number;
  mimeType?: string;
  name?: string;
  type?: string;
  width?: number;
}

export interface ImagePickerOpenChangeParams {
  reason: 'trigger' | 'action' | 'cancel';
}

export interface ImagePickerPickOptions {
  maxCount: number;
  multiple: boolean;
}

export interface ImagePickerStyles {
  trigger?: StyleProp<ViewStyle>;
  triggerContent?: StyleProp<ViewStyle>;
  iconContainer?: StyleProp<ViewStyle>;
  status?: StyleProp<TextStyle>;
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
  removeButton?: StyleProp<ViewStyle>;
  empty?: StyleProp<ViewStyle>;
  emptyText?: StyleProp<TextStyle>;
}

export type ImagePickerSelectedValue = ImagePickerValue | ImagePickerValue[];

export type ImagePickerDisplayInputProps = Omit<
  DisplayInputProps,
  'label' | 'disabled' | 'readonly' | 'valueText' | 'style' | 'styles'
>;

interface ImagePickerBaseProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (
    open: boolean,
    params: ImagePickerOpenChangeParams,
  ) => void;
  onError?: (error: unknown) => void;
  readonly?: boolean;
  disabled?: boolean;
  label?: DisplayInputProps['label'];
  labelText?: string;
  displayInputProps?: ImagePickerDisplayInputProps;
  cameraText?: string;
  photoText?: string;
  fileSystemText?: string;
  cancelText?: string;
  doneText?: string;
  titleText?: string;
  multipleHintText?: string;
  emptyText?: string;
  sources?: ImagePickerSource[];
  selectedText?: string;
  unselectedText?: string;
  maxCount?: number;
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

export type ImagePickerProps = ImagePickerSingleProps | ImagePickerMultipleProps;
