import { createUseSheetStyle } from '@pennyspring/theme';
import type { ComponentSize } from '../../shares/types';

interface TagValueDisplayStyleOptions {
  size: ComponentSize;
  wrap: boolean;
}

export const useTagValueDisplayStyles = createUseSheetStyle(
  (token, { wrap }: TagValueDisplayStyleOptions) => ({
    container: {
      flexDirection: 'row',
      flexWrap: wrap ? 'wrap' : 'nowrap',
      alignItems: 'center',
      gap: token.sizeXXS,
      overflow: wrap ? undefined : 'hidden',
      flex: 1,
      minWidth: 0,
    },
    tagItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: token.sizeXXS,
    },
  }),
);
