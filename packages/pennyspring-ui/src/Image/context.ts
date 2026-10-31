import { createContext } from 'react';
import type { ImageSourcePropType } from 'react-native';

export interface RegisteredImage {
  src: ImageSourcePropType;
}

export interface ImagePreviewGroupContextValue {
  onPreview: (id: string, src: ImageSourcePropType) => void;
  register: (id: string, data: RegisteredImage) => () => void;
}

export const ImagePreviewGroupContext =
  createContext<ImagePreviewGroupContextValue | null>(null);
