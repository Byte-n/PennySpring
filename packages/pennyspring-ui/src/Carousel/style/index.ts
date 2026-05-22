import { createUseSheetStyle } from '@pennyspring/theme';

export const useCarouselStyles = createUseSheetStyle(theme => ({
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
    backgroundColor: theme.colorBgContainer,
    opacity: theme.opacityLoading,
  },
  indicatorDotActive: {
    opacity: 1,
  },
}));
