import { createUseSheetStyle } from '@pennyspring/theme';

interface FormScrollStyleOptions {
  bottomInset: number;
}

interface ScreenStyleOptions {
  bottomInset: number;
}

interface StickyFooterStyleOptions {
  bottomInset: number;
}

export const useScreenStyles = createUseSheetStyle(
  (_token, { bottomInset }: ScreenStyleOptions) => ({
    root: {
      flex: 1,
      paddingBottom: bottomInset,
    },
  }),
);

export const useFormScrollStyles = createUseSheetStyle(
  (_token, { bottomInset }: FormScrollStyleOptions) => ({
    root: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
      // 页面边距由页面自己提供，这里只补键盘遮挡与调用方显式追加的留白。
      paddingBottom: bottomInset,
    },
  }),
);

export const useStickyFooterStyles = createUseSheetStyle(
  (token, { bottomInset }: StickyFooterStyleOptions) => ({
    root: {
      width: '100%',
      paddingBottom: bottomInset,
      borderTopColor: token.colorSplit,
      borderTopWidth: token.lineWidth,
      backgroundColor: token.colorBgContainer,
    },
  }),
);
