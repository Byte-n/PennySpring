import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { DimensionValue } from 'react-native';
import type { SkeletonShape } from '../types';
import type { ComponentSize } from '../../shares/types';

export interface SkeletonStyleOptions {
  width: DimensionValue;
  height: number;
  borderRadius: number;
  shimmerWidth: number;
  fadeMinHeight: number;
}

/** AliasToken 没有骨架屏档位；line 对齐行高，circle / rect 为语义常量。 */
const LINE_SMALL = 12;
const LINE_NORMAL = 16;
const LINE_LARGE = 20;
const CIRCLE_SMALL = 32;
const CIRCLE_NORMAL = 40;
const CIRCLE_LARGE = 48;
const RECT_SMALL = 48;
const RECT_NORMAL = 64;
const RECT_LARGE = 80;
const LINE_RADIUS_SMALL = 4;
const LINE_RADIUS_NORMAL = 6;
const LINE_RADIUS_LARGE = 8;
export const SHIMMER_WIDTH_RATIO = 0.4;
export const SHIMMER_DURATION = 1200;

const CIRCLE_SIZE_MAP: Record<ComponentSize, number> = {
  small: CIRCLE_SMALL,
  normal: CIRCLE_NORMAL,
  large: CIRCLE_LARGE,
};

const RECT_HEIGHT_MAP: Record<ComponentSize, number> = {
  small: RECT_SMALL,
  normal: RECT_NORMAL,
  large: RECT_LARGE,
};

const LINE_HEIGHT_MAP: Record<ComponentSize, number> = {
  small: LINE_SMALL,
  normal: LINE_NORMAL,
  large: LINE_LARGE,
};

const LINE_RADIUS_MAP: Record<ComponentSize, number> = {
  small: LINE_RADIUS_SMALL,
  normal: LINE_RADIUS_NORMAL,
  large: LINE_RADIUS_LARGE,
};

export function getDefaultWidth(
  shape: SkeletonShape,
  size: ComponentSize,
): DimensionValue {
  return shape === 'circle' ? CIRCLE_SIZE_MAP[size] : '100%';
}

export function getDefaultHeight(
  shape: SkeletonShape,
  size: ComponentSize,
): number {
  if (shape === 'line') {
    return LINE_HEIGHT_MAP[size];
  }

  if (shape === 'circle') {
    return CIRCLE_SIZE_MAP[size];
  }

  return RECT_HEIGHT_MAP[size];
}

export function getDefaultBorderRadius(
  shape: SkeletonShape,
  token: AliasToken,
  size: ComponentSize,
  height: number,
): number {
  switch (shape) {
    case 'circle':
      return height / 2;
    case 'rect':
      return token.borderRadius;
    case 'line':
    default:
      return LINE_RADIUS_MAP[size];
  }
}

export const useStyles = createUseSheetStyle(
  (token, { width, height, borderRadius, shimmerWidth, fadeMinHeight }: SkeletonStyleOptions) => ({
    root: {
      backgroundColor: token.colorFillContent,
      borderRadius,
      height,
      overflow: 'hidden' as const,
      width,
    },
    shimmer: {
      backgroundColor: token.colorFillContentHover,
      borderRadius,
      bottom: 0,
      left: 0,
      position: 'absolute' as const,
      top: 0,
      width: shimmerWidth,
    },
    fade: {
      minHeight: fadeMinHeight,
    },
  }),
);
