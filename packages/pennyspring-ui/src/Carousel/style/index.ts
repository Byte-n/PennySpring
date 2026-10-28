import { createUseSheetStyle } from '@pennyspring/theme';
import type { TextStyle, ViewStyle } from 'react-native';

interface CarouselStyleOptions {
  slidePixels?: number;
  direction?: 'horizontal' | 'vertical';
  leadingSize?: number;
  trailingSize?: number;
}

export interface CarouselStyleSheet {
  [key: string]: ViewStyle | TextStyle;
  container: ViewStyle;
  track: ViewStyle;
  trackInner: ViewStyle;
  trackInnerHorizontal: ViewStyle;
  trackInnerVertical: ViewStyle;
  slide: ViewStyle;
  slideWrapper: ViewStyle;
  spacerLeading: ViewStyle;
  spacerTrailing: ViewStyle;
  indicatorContainer: ViewStyle;
  indicatorDot: ViewStyle;
  indicatorDotActive: ViewStyle;
  indicatorCounter: ViewStyle;
  indicatorCounterText: TextStyle;
}

/** AliasToken 没有指示点档位；6px 圆点、16×6 选中胶囊为语义常量。 */
export const CAROUSEL_DOT_SIZE = 6;
export const CAROUSEL_DOT_ACTIVE_WIDTH = 16;
const PILL_RADIUS = 999;
const COUNTER_HEIGHT = 20;

export const useCarouselStyles = createUseSheetStyle<
  CarouselStyleOptions,
  CarouselStyleSheet
>(
  (theme, options) => {
    const slidePixels = options?.slidePixels ?? 0;
    const direction = options?.direction ?? 'horizontal';
    const leadingSize = options?.leadingSize ?? 0;
    const trailingSize = options?.trailingSize ?? 0;

    return {
      container: {
        overflow: 'hidden',
        height: '100%',
        width: '100%',
      },
      track: {
        flex: 1,
        overflow: 'hidden',
      },
      trackInner: {
        flexGrow: 0,
        flexShrink: 0,
      },
      trackInnerHorizontal: {
        flexDirection: 'row',
        height: '100%',
        flexGrow: 0,
        flexShrink: 0,
      },
      trackInnerVertical: {
        flexDirection: 'column',
        width: '100%',
        flexGrow: 0,
        flexShrink: 0,
      },
      slide: {
        flexGrow: 0,
        flexShrink: 0,
        overflow: 'hidden',
      },
      slideWrapper:
        direction === 'horizontal'
          ? {
              width: slidePixels,
              height: '100%',
            }
          : {
              height: slidePixels,
              width: '100%',
            },
      spacerLeading:
        direction === 'horizontal' ? { width: leadingSize } : { height: leadingSize },
      spacerTrailing:
        direction === 'horizontal'
          ? { width: trailingSize }
          : { height: trailingSize },
      indicatorContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: theme.paddingSM,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: theme.sizeXS,
      },
      indicatorDot: {
        width: CAROUSEL_DOT_SIZE,
        height: CAROUSEL_DOT_SIZE,
        borderRadius: PILL_RADIUS,
        backgroundColor: theme.colorTextQuaternary,
      },
      indicatorDotActive: {
        backgroundColor: theme.colorPrimary,
      },
      indicatorCounter: {
        position: 'absolute',
        right: theme.paddingSM,
        bottom: theme.paddingSM,
        height: COUNTER_HEIGHT,
        borderRadius: PILL_RADIUS,
        backgroundColor: theme.colorBgMask,
        justifyContent: 'center',
        paddingHorizontal: theme.paddingXS,
      },
      indicatorCounterText: {
        fontVariant: ['tabular-nums' as const],
      },
    };
  },
);
