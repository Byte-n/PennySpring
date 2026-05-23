import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { DisplayInputProps, DisplayInputStyles } from '../DisplayInput';

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

export interface ImagePickerStyles {
  trigger?: StyleProp<ViewStyle>;
  input?: DisplayInputStyles & {
    root?: StyleProp<ViewStyle>;
  };
}

export type ImagePickerDisplayInputProps = Omit<
  DisplayInputProps,
  'label' | 'placeholder' | 'disabled' | 'readonly' | 'valueText' | 'style' | 'styles'
>;

export interface ImagePickerProps {
  value?: ImagePickerValue;
  defaultValue?: ImagePickerValue;
  onChange?: (value: ImagePickerValue) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (
    open: boolean,
    params: ImagePickerOpenChangeParams,
  ) => void;
  onError?: (error: unknown) => void;
  label?: DisplayInputProps['label'];
  placeholder?: string;
  readonly?: boolean;
  disabled?: boolean;
  displayInputProps?: ImagePickerDisplayInputProps;
  photoText?: string;
  fileSystemText?: string;
  cancelText?: string;
  sources?: ImagePickerSource[];
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: ImagePickerStyles;
}
