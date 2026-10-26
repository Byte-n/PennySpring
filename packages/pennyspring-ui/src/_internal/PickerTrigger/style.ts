import { createUseSheetStyle } from '@pennyspring/theme';

export const useStyles = createUseSheetStyle(token => ({
  clearButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: token.paddingXXS,
    borderRadius: token.borderRadiusSM,
  },
  clearButtonPressed: {
    backgroundColor: token.colorFillTertiary,
  },
  underlineActive: {
    backgroundColor: token.colorPrimary,
  },
}));
