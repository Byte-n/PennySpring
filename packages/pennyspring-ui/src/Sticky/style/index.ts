import { createUseSheetStyle } from '@pennyspring/theme';

export const useStickyLayoutStyles = createUseSheetStyle(token => ({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  overlay: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: token.zIndexBase,
  },
}));

interface StickyPlaceholderStyleOptions {
  height: number;
}

export const useStickyPlaceholderStyles = createUseSheetStyle(
  (_token, { height }: StickyPlaceholderStyleOptions) => ({
    root: {
      minHeight: height,
      opacity: 0,
      width: '100%',
    },
  }),
);
