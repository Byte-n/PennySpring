import { createUseSheetStyle } from '@pennyspring/theme';

interface PickerWheelStyleOptions {
  itemHeight: number;
  wheelHeight: number;
}

const CENTER_OFFSET_DIVISOR = 2;

export const usePickerWheelStyles = createUseSheetStyle(
  (_token, { itemHeight, wheelHeight }: PickerWheelStyleOptions) => {
    const wheelInset = Math.max(
      0,
      (wheelHeight - itemHeight) / CENTER_OFFSET_DIVISOR,
    );

    return {
      columnContent: {
        paddingVertical: wheelInset,
      },
      columnScroll: {
        height: wheelHeight,
      },
      indicator: {
        top: wheelInset,
      },
    };
  },
);
