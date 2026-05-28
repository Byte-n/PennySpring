import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { DimensionValue } from 'react-native';
import type { SkeletonShape } from '../types';
import type { ComponentSize } from '../../shares/types';

export interface SkeletonStyleOptions {
  width: DimensionValue;
  height: number;
  borderRadius: number;
}

export function getDefaultWidth(shape: SkeletonShape, token: AliasToken): DimensionValue {
  return shape === 'circle' ? token.controlHeightSM : '100%';
}

export function getDefaultHeight(shape: SkeletonShape, size: ComponentSize, token: AliasToken): number {
  if (shape === 'line') {
    if (size === 'small') {
      return token.fontSizeSM;
    }

    if (size === 'large') {
      return token.fontSizeLG;
    }

    return token.fontSize;
  }

  if (size === 'small') {
    return token.controlHeightSM;
  }

  if (size === 'large') {
    return token.controlHeightLG;
  }

  switch (shape) {
    case 'circle':
    case 'rect':
    default:
      return token.controlHeight;
  }
}

export function getDefaultBorderRadius(shape: SkeletonShape, token: AliasToken, height: number): number {
  switch (shape) {
    case 'circle':
      return height / 2;
    case 'rect':
      return token.borderRadius;
    case 'line':
    default:
      return token.borderRadiusSM;
  }
}

export const useStyles = createUseSheetStyle(
  (token, { width, height, borderRadius }: SkeletonStyleOptions) => ({
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
      right: 0,
      top: 0,
      width: '50%',
    },
  }),
);
