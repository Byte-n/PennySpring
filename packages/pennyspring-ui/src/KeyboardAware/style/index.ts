import { createUseSheetStyle } from '@pennyspring/theme';

interface FormScrollStyleOptions {
  bottomInset: number;
}

interface StickyFooterStyleOptions {
  bottomInset: number;
}

export const useScreenStyles = createUseSheetStyle(() => ({
  root: {
    flex: 1,
  },
}));

export const useFormScrollStyles = createUseSheetStyle(
  (token, { bottomInset }: FormScrollStyleOptions) => ({
    root: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
      paddingBottom: bottomInset + token.paddingMD,
    },
  }),
);

export const useStickyFooterStyles = createUseSheetStyle(
  (token, { bottomInset }: StickyFooterStyleOptions) => ({
    root: {
      width: '100%',
      paddingBottom: bottomInset,
      backgroundColor: token.colorBgContainer,
    },
  }),
);
