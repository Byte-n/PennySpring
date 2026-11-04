import { createUseSheetStyle, toShadowStyle } from '@pennyspring/ui';

const DRAFT_THUMB_SIZE = 56;
const HINT_ICON_SIZE = 28;

export const useDraftTabStyles = createUseSheetStyle(token => ({
  container: {
    flex: 1,
    backgroundColor: token.colorBgLayout,
  },
  content: {
    flexGrow: 1,
    gap: token.marginSM,
    padding: token.padding,
    paddingBottom: token.paddingXL,
  },
  state: {
    flexGrow: 1,
    paddingVertical: token.paddingLG,
  },
  summary: {
    paddingHorizontal: token.paddingXXS,
    paddingTop: token.paddingXXS,
  },
  card: {
    gap: token.marginXS,
    padding: token.paddingSM,
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    borderWidth: token.lineWidth,
    borderColor: token.colorSplit,
    ...toShadowStyle(token.boxShadowTertiary),
  },
  cardHead: {
    gap: token.marginXS,
    alignItems: 'center',
  },
  thumb: {
    width: DRAFT_THUMB_SIZE,
    height: DRAFT_THUMB_SIZE,
    borderRadius: token.borderRadius,
  },
  meta: {
    flex: 1,
    minWidth: 0,
    gap: token.marginXXS,
  },
  items: {
    gap: token.marginXS,
    paddingTop: token.paddingXS,
    borderTopWidth: token.lineWidth,
    borderTopColor: token.colorSplit,
  },
  itemRow: {
    alignItems: 'flex-start',
    gap: token.marginXS,
  },
  itemCopy: {
    flex: 1,
    minWidth: 0,
    gap: token.marginXXS,
  },
  itemAmount: {
    alignItems: 'flex-end',
  },
  num: {
    fontVariant: ['tabular-nums'],
  },
  actions: {
    justifyContent: 'flex-end',
    gap: token.marginXS,
    paddingTop: token.paddingXS,
    borderTopWidth: token.lineWidth,
    borderTopColor: token.colorSplit,
  },
  errorText: {
    paddingTop: token.paddingXXS,
  },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: token.marginXS,
    padding: token.paddingSM,
    borderRadius: token.borderRadiusLG,
    borderWidth: token.lineWidth,
    borderStyle: 'dashed',
    borderColor: token.colorBorder,
  },
  hintIcon: {
    width: HINT_ICON_SIZE,
    height: HINT_ICON_SIZE,
    borderRadius: token.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: token.colorPrimaryBg,
    flexShrink: 0,
  },
  hintCopy: {
    flex: 1,
    minWidth: 0,
    gap: token.marginXXS,
  },
}));
