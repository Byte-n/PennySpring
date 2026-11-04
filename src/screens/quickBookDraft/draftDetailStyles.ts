import { createUseSheetStyle, toShadowStyle } from '@pennyspring/ui';

const DRAFT_HEADER_THUMB_SIZE = 64;

export const useDraftDetailStyles = createUseSheetStyle(token => ({
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
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: token.marginXS,
    padding: token.paddingSM,
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    borderWidth: token.lineWidth,
    borderColor: token.colorSplit,
    ...toShadowStyle(token.boxShadowTertiary),
  },
  headerThumb: {
    width: DRAFT_HEADER_THUMB_SIZE,
    height: DRAFT_HEADER_THUMB_SIZE,
    borderRadius: token.borderRadius,
  },
  headerThumbPlaceholder: {
    width: DRAFT_HEADER_THUMB_SIZE,
    height: DRAFT_HEADER_THUMB_SIZE,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorFillQuaternary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    gap: token.marginXXS,
  },
  warningStrip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: token.marginXS,
    padding: token.paddingXS,
    borderRadius: token.borderRadiusLG,
    backgroundColor: token.colorWarningBg,
  },
  warningText: {
    flex: 1,
    minWidth: 0,
  },
  bookRow: {
    alignItems: 'center',
    gap: token.marginXS,
    padding: token.paddingSM,
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    borderWidth: token.lineWidth,
    borderColor: token.colorSplit,
    ...toShadowStyle(token.boxShadowTertiary),
  },
  bookCopy: {
    flex: 1,
    minWidth: 0,
    gap: token.marginXXS,
  },
  completeCard: {
    gap: token.marginXXS,
    padding: token.paddingSM,
    borderRadius: token.borderRadiusLG,
    backgroundColor: token.colorSuccessBg,
  },
  itemCard: {
    gap: token.marginXS,
    padding: token.paddingSM,
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    borderWidth: token.lineWidth,
    borderColor: token.colorSplit,
    ...toShadowStyle(token.boxShadowTertiary),
  },
  itemHead: {
    alignItems: 'center',
  },
  itemNotice: {
    padding: token.paddingXS,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorWarningBg,
  },
  itemActions: {
    justifyContent: 'flex-end',
    gap: token.marginXS,
    marginTop: token.marginXXS,
  },
  recordImageThumb: {
    width: token.controlHeight,
    height: token.controlHeight,
    borderRadius: token.borderRadius,
  },
  missingAmount: {
    flexShrink: 1,
  },
}));
