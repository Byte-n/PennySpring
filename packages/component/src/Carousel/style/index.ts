import { createUseSheetStyle } from '@pennyspring/theme';

const INDICATOR_DOT_SIZE = 6;

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
    width: INDICATOR_DOT_SIZE,
    height: INDICATOR_DOT_SIZE,
    borderRadius: 999,
    backgroundColor: theme.colorBgContainer,
    opacity: 0.6,
  },
  indicatorDotActive: {
    opacity: 1,
  },
}));
