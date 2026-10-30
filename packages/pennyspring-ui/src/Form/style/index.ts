import { createUseSheetStyle } from '@pennyspring/theme';
import type { FormLayout } from '../types.ts';

interface FormItemStyleOptions {
  labelWidth?: number;
  layout: FormLayout;
}

export const useFormItemStyles = createUseSheetStyle(
  (token, { labelWidth, layout }: FormItemStyleOptions) => ({
    root: {
      gap: token.marginXS,
    },
    labelColumn: {
      flexShrink: 0,
      width: labelWidth,
      paddingTop: layout === 'horizontal' ? token.marginXXS : undefined,
    },
    content: {
      flex: 1,
      gap: token.marginXS,
      minWidth: 0,
    },
  }),
);
