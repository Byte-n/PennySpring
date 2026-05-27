import { createUseSheetStyle } from '@pennyspring/theme';

interface CarouselStyleOptions {
  activeColor?: string;
  inactiveColor?: string;
  slidePixels?: number;
  direction?: 'horizontal' | 'vertical';
  leadingSize?: number;
  trailingSize?: number;
}

export const useCarouselStyles = createUseSheetStyle<CarouselStyleOptions>(
  (theme, options) => {
    const activeColor = options?.activeColor ?? theme.colorPrimary;
    const inactiveColor = options?.inactiveColor ?? theme.colorPrimaryBg;
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
        bottom: theme.marginSM,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: theme.marginSM,
      },
      indicatorDot: {
        width: theme.sizeXXS,
        height: theme.sizeXXS,
        borderRadius: theme.borderRadiusXS,
        backgroundColor: inactiveColor,
        opacity: theme.opacityLoading,
      },
      indicatorDotActive: {
        backgroundColor: activeColor,
        opacity: 1,
      },
    };
  },
);
