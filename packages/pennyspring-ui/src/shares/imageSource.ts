import { Platform } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

/**
 * RN 0.85 的 Android Image 仅在 source 为数组时向原生转发 headers，
 * 单个带 headers 的 source 会丢失鉴权头，这里统一包成单元素数组。
 */
export function toNativeImageSource(
  source: ImageSourcePropType,
): ImageSourcePropType {
  if (
    Platform.OS !== 'android' ||
    typeof source === 'number' ||
    Array.isArray(source) ||
    source.headers === undefined ||
    Object.keys(source.headers).length === 0
  ) {
    return source;
  }

  return [source];
}
