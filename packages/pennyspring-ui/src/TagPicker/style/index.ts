import { createUseSheetStyle } from '@pennyspring/theme';

export const useTagPickerStyles = createUseSheetStyle(token => ({
  content: {
    gap: token.marginSM,
  },
  section: {
    gap: token.marginXS,
  },
  sectionHeader: {
    alignItems: 'baseline',
    gap: token.marginXS,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: token.marginSM,
  },
  chip: {
    maxWidth: '100%',
  },
  chipLabel: {
    flexShrink: 1,
  },
  chipLabelMuted: {
    color: token.colorTextTertiary,
    flexShrink: 1,
  },
  state: {
    alignItems: 'center',
    paddingVertical: token.paddingSM,
  },
}));
