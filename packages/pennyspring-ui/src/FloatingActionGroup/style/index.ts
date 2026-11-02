import {
  createUseSheetStyle,
  toShadowStyle,
  type AliasToken,
} from '@pennyspring/theme';
import type { ComponentSize } from '../../shares/types';
import type { FloatingLayout } from '../types';
import { resolveMetrics } from '../layout';

const PILL_RADIUS = 999;
const RAIL_WIDTH = 2;
const RAIL_HEIGHT = 44;

interface TriggerStyleOptions {
  isDragging: boolean;
  size: ComponentSize;
  spacing?: number;
}

interface ActionStyleOptions {
  isDisabled: boolean;
  itemLeft: number;
  itemTop: number;
  labelLeft: number;
  labelTop: number;
  layout: FloatingLayout;
  size: ComponentSize;
  spacing?: number;
}

export const useRootStyles = createUseSheetStyle((token: AliasToken) => ({
  root: {
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: token.zIndexPopupBase + token.zIndexBase,
  },
}));

export const useOverlayStyles = createUseSheetStyle((token: AliasToken) => ({
  overlay: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  scrim: {
    backgroundColor: token.colorBgMask,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
}));

export const useTriggerStyles = createUseSheetStyle(
  (token: AliasToken, { isDragging, size, spacing }: TriggerStyleOptions) => {
    const metrics = resolveMetrics(size, spacing);

    return {
      trigger: {
        backgroundColor: token.colorPrimary,
        borderRadius: metrics.radius,
        height: metrics.anchorSize,
        overflow: 'hidden',
        width: metrics.anchorSize,
        ...toShadowStyle(
          isDragging ? token.boxShadow : token.boxShadowSecondary,
        ),
      },
      triggerDisabled: {
        opacity: token.opacityLoading,
      },
      triggerPressable: {
        alignItems: 'center',
        height: '100%',
        justifyContent: 'center',
        width: '100%',
      },
      triggerPressed: {
        backgroundColor: token.colorPrimaryHover,
      },
    };
  },
);

export const useActionStyles = createUseSheetStyle(
  (
    token: AliasToken,
    {
      isDisabled,
      itemLeft,
      itemTop,
      labelLeft,
      labelTop,
      layout,
      size,
      spacing,
    }: ActionStyleOptions,
  ) => {
    const metrics = resolveMetrics(size, spacing);

    return {
      item: {
        height: metrics.anchorSize,
        left: itemLeft,
        position: 'absolute',
        top: itemTop,
        width: metrics.anchorSize,
      },
      face: {
        alignItems: 'center',
        backgroundColor: isDisabled
          ? token.colorFillQuaternary
          : token.colorBgContainer,
        borderColor: token.colorSplit,
        borderRadius: layout === 'fan' ? PILL_RADIUS : metrics.radius,
        borderWidth: token.lineWidth,
        height: metrics.anchorSize,
        justifyContent: 'center',
        overflow: 'hidden',
        width: metrics.anchorSize,
      },
      faceDisabled: {
        opacity: token.opacityLoading,
      },
      buttonText: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        borderRadius: 0,
        height: '100%',
        paddingHorizontal: 0,
        width: '100%',
      },
      buttonFilled: {
        borderWidth: 0,
        borderRadius: 0,
        height: '100%',
        paddingHorizontal: 0,
        width: '100%',
      },
      labelContainer: {
        alignItems: 'center',
        height: metrics.labelHeight,
        left: labelLeft,
        position: 'absolute',
        top: labelTop,
        width: metrics.labelMaxWidth,
      },
      label: {
        backgroundColor: token.colorBgContainer,
        borderRadius: PILL_RADIUS,
        height: metrics.labelHeight,
        lineHeight: metrics.labelHeight,
        maxWidth: metrics.labelMaxWidth,
        paddingHorizontal: token.paddingXXS,
        textAlign: 'center',
      },
    };
  },
);

export const useRailStyles = createUseSheetStyle((token: AliasToken) => ({
  rail: {
    backgroundColor: token.colorPrimary,
    borderRadius: PILL_RADIUS,
    height: RAIL_HEIGHT,
    position: 'absolute',
    width: RAIL_WIDTH,
  },
}));
