import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { DisplayInputProps } from '../DisplayInput';

export type ImagePickerSource = 'photo' | 'fileSystem';

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
  status?: StyleProp<ViewStyle>;
}

export type ImagePickerSelectedValue = ImagePickerValue | ImagePickerValue[];

export type ImagePickerDisplayInputProps = Omit<
  DisplayInputProps,
  'label' | 'placeholder' | 'disabled' | 'readonly' | 'valueText' | 'style' | 'styles'
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
  placeholder?: string;
  displayInputProps?: ImagePickerDisplayInputProps;
  photoText?: string;
  fileSystemText?: string;
  cancelText?: string;
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
