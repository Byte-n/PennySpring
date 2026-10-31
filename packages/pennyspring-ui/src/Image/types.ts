import type { ReactNode } from 'react';
import type {
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';

export type ImageFit = 'cover' | 'contain';

export type ImageRadius = 'none' | 'small' | 'normal' | 'large' | 'circle';

export interface ImagePreviewConfig {
  /** 预览使用的图片源，默认复用 Image 的 src。 */
  src?: ImageSourcePropType;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCancel?: () => void;
}

export interface ImageStyles {
  root?: StyleProp<ViewStyle>;
  image?: StyleProp<ImageStyle>;
  error?: StyleProp<ViewStyle>;
  errorText?: StyleProp<TextStyle>;
}

export interface ImageProps {
  src: ImageSourcePropType;
  fit?: ImageFit;
  radius?: ImageRadius;
  /** 是否可预览；传 false 时只负责展示。默认 true。 */
  preview?: boolean | ImagePreviewConfig;
  onPress?: () => void;
  /** 自定义失败内容；undefined 使用默认失败态，null 表示不渲染内容。 */
  error?: ReactNode | null;
  style?: StyleProp<ViewStyle>;
  styles?: ImageStyles;
  testID?: string;
}

export interface ImagePreviewStyles {
  overlay?: StyleProp<ViewStyle>;
  topBar?: StyleProp<ViewStyle>;
  closeButton?: StyleProp<ViewStyle>;
  countPill?: StyleProp<ViewStyle>;
  countText?: StyleProp<TextStyle>;
  stage?: StyleProp<ViewStyle>;
  page?: StyleProp<ViewStyle>;
  image?: StyleProp<ImageStyle>;
  loading?: StyleProp<ViewStyle>;
  error?: StyleProp<ViewStyle>;
  errorText?: StyleProp<TextStyle>;
}

export interface ImagePreviewProps {
  images: readonly ImageSourcePropType[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCancel?: () => void;
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  style?: StyleProp<ViewStyle>;
  styles?: ImagePreviewStyles;
  testID?: string;
}

export interface ImagePreviewGroupItem {
  src: ImageSourcePropType;
}

export type ImagePreviewGroupItemInput =
  | ImageSourcePropType
  | ImagePreviewGroupItem;

export interface ImagePreviewGroupProps {
  /**
   * 数据驱动预览源，提供时优先于 children 自动注册的图片。
   * children 的预览顺序按挂载注册顺序；需要稳定顺序时使用 items。
   */
  items?: readonly ImagePreviewGroupItemInput[];
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCancel?: () => void;
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  styles?: ImagePreviewStyles;
}
