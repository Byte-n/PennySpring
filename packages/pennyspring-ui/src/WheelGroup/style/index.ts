import { createUseSheetStyle } from '@pennyspring/theme';

export interface WheelGroupStyleOptions {
  containerHeight: number;
  contentInset: number;
  fill: boolean;
  itemHeight: number;
  viewportHeight: number;
}

const BAND_OFFSET_DIVISOR = 2;

export const useWheelGroupStyles = createUseSheetStyle(
  (token, options: WheelGroupStyleOptions) => ({
    root: {
      alignSelf: 'stretch',
      height: options.fill ? '100%' : options.containerHeight,
      justifyContent: 'center',
    },
    band: {
      position: 'absolute',
      top: (options.containerHeight - options.itemHeight) / BAND_OFFSET_DIVISOR,
      left: 0,
      right: 0,
      height: options.itemHeight,
      backgroundColor: token.controlItemBgActive,
      borderTopWidth: token.lineWidth,
      borderBottomWidth: token.lineWidth,
      borderColor: token.colorBorderSecondary,
    },
    column: {
      flex: 1,
      height: options.viewportHeight,
    },
    content: {
      paddingVertical: options.contentInset,
    },
    item: {
      height: options.itemHeight,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: token.paddingSM,
    },
    itemDisabled: {
      opacity: token.opacityLoading,
    },
    empty: {
      flex: 1,
      height: options.viewportHeight,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: token.paddingSM,
    },
  }),
);
