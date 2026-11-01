import type { ImageSourcePropType } from 'react-native';
import type {
  ImagePreviewGroupItem,
  ImagePreviewGroupItemInput,
} from './types';

export interface DisplayedImageSize {
  height: number;
  width: number;
}

export interface ImageTransform {
  scale: number;
  x: number;
  y: number;
}

export interface ImageDisplayMetrics {
  containerHeight: number;
  containerWidth: number;
  imageHeight: number;
  imageWidth: number;
}

const DOUBLE_TAP_SCALE = 2;

export interface PinchTransformInput {
  focalX: number;
  focalY: number;
  nextScale: number;
  savedScale: number;
  savedX: number;
  savedY: number;
}

function isWrappedPreviewItem(
  item: ImagePreviewGroupItemInput,
): item is ImagePreviewGroupItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    !Array.isArray(item) &&
    'src' in item
  );
}

export function normalizePreviewItems(
  items: readonly ImagePreviewGroupItemInput[],
): ImageSourcePropType[] {
  return items.map(item => (isWrappedPreviewItem(item) ? item.src : item));
}

export function getSourceKey(src: ImageSourcePropType): string {
  if (typeof src === 'number') {
    return `asset:${src}`;
  }

  if (Array.isArray(src)) {
    return `array:${src
      .map(item => (typeof item === 'number' ? item : (item.uri ?? '')))
      .join('|')}`;
  }

  return `uri:${src.uri ?? ''}`;
}

export function isSameImageSource(
  first: ImageSourcePropType,
  second: ImageSourcePropType,
): boolean {
  if (first === second) {
    return true;
  }

  if (typeof first === 'number' || typeof second === 'number') {
    return false;
  }

  if (Array.isArray(first) || Array.isArray(second)) {
    return false;
  }

  return first.uri !== undefined && first.uri === second.uri;
}

export function clampIndex(index: number, length: number): number {
  if (length <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(index, length - 1));
}

export function getDisplayedImageSize({
  containerHeight,
  containerWidth,
  imageHeight,
  imageWidth,
}: ImageDisplayMetrics): DisplayedImageSize {
  'worklet';

  if (
    imageWidth <= 0 ||
    imageHeight <= 0 ||
    containerWidth <= 0 ||
    containerHeight <= 0
  ) {
    return { height: containerHeight, width: containerWidth };
  }

  const fitScale = Math.min(
    containerWidth / imageWidth,
    containerHeight / imageHeight,
  );

  return {
    height: imageHeight * fitScale,
    width: imageWidth * fitScale,
  };
}

export function getMaxTranslation({
  containerHeight,
  containerWidth,
  imageHeight,
  imageWidth,
  scale,
}: ImageDisplayMetrics & { scale: number }): { x: number; y: number } {
  'worklet';

  const displayed = getDisplayedImageSize({
    containerHeight,
    containerWidth,
    imageHeight,
    imageWidth,
  });

  return {
    x: Math.max(0, (displayed.width * scale - containerWidth) / 2),
    y: Math.max(0, (displayed.height * scale - containerHeight) / 2),
  };
}

export function getPinchTransform({
  focalX,
  focalY,
  nextScale,
  savedScale,
  savedX,
  savedY,
}: PinchTransformInput): ImageTransform {
  'worklet';

  const ratio = savedScale <= 0 ? 1 : nextScale / savedScale;

  return {
    scale: nextScale,
    x: focalX - (focalX - savedX) * ratio,
    y: focalY - (focalY - savedY) * ratio,
  };
}

export function getDoubleTapTransform({
  focalX,
  focalY,
}: {
  focalX: number;
  focalY: number;
}): ImageTransform {
  'worklet';

  return {
    scale: DOUBLE_TAP_SCALE,
    x: -focalX,
    y: -focalY,
  };
}
