import { createUseSheetStyle } from '@pennyspring/theme';

const INFO_LABEL_WIDTH = 48;
const RECORD_IMAGE_THUMB_SIZE = 32;

export const useRecordDetailStyles = createUseSheetStyle(token => ({
  panelHeader: {
    paddingHorizontal: token.padding,
    paddingTop: 0,
    paddingBottom: token.paddingXXS,
  },
  panelHandle: {
    minHeight: token.paddingMD,
  },
  panelBody: {
    paddingTop: token.paddingXXS,
    paddingBottom: token.paddingXXS,
  },
  panelFooter: {
    paddingTop: token.paddingXS,
    paddingBottom: token.paddingMD,
    gap: token.sizeXS,
  },
  headerRow: {
    width: '100%',
    alignItems: 'center',
  },
  headerTitle: {
    lineHeight: token.lineHeightSM,
  },
  hero: {
    paddingBottom: token.paddingSM,
    borderBottomWidth: token.lineWidth,
    borderBottomColor: token.colorSplit,
  },
  heroTop: {
    width: '100%',
  },
  heroType: {
    flex: 1,
    minWidth: 0,
  },
  typeIcon: {
    width: token.controlHeightSM,
    height: token.controlHeightSM,
    borderRadius: token.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  typeIconExpense: {
    backgroundColor: token.colorErrorBg,
  },
  typeIconIncome: {
    backgroundColor: token.colorSuccessBg,
  },
  typeIconTransfer: {
    backgroundColor: token.colorPrimaryBg,
  },
  heroText: {
    flex: 1,
    minWidth: 0,
  },
  badge: {
    height: token.controlHeightXS,
    paddingHorizontal: token.paddingXS,
    borderRadius: token.controlHeight,
    backgroundColor: token.colorWarningBg,
    gap: token.marginXXS,
    alignItems: 'center',
    flexShrink: 0,
  },
  badgeDot: {
    width: token.sizeXS,
    height: token.sizeXS,
    borderRadius: token.sizeXS,
    backgroundColor: token.colorWarning,
  },
  amountRow: {
    width: '100%',
    marginTop: token.marginXS,
  },
  amountText: {
    flexShrink: 1,
  },
  amountInteger: {
    lineHeight: token.lineHeightHeading3,
  },
  amountAffix: {
    opacity: token.opacityLoading,
  },
  num: {
    fontVariant: ['tabular-nums'],
  },
  infoCard: {
    marginTop: token.marginSM,
    paddingHorizontal: token.paddingSM,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorFillQuaternary,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: token.sizeXS,
    paddingVertical: token.paddingXS,
    borderTopWidth: token.lineWidth,
    borderTopColor: token.colorSplit,
  },
  infoRowFirst: {
    borderTopWidth: 0,
  },
  infoRowBlock: {
    alignItems: 'flex-start',
  },
  infoLabel: {
    width: INFO_LABEL_WIDTH,
  },
  infoLabelBlock: {
    lineHeight: token.lineHeightSM,
  },
  infoValue: {
    flex: 1,
    minWidth: 0,
  },
  imageThumb: {
    width: RECORD_IMAGE_THUMB_SIZE,
    height: RECORD_IMAGE_THUMB_SIZE,
  },
  chips: {
    gap: token.marginXS,
    alignItems: 'center',
  },
  chip: {
    height: token.controlHeightXS,
    paddingHorizontal: token.paddingXS,
    borderRadius: token.controlHeight,
    backgroundColor: token.colorFillSecondary,
    gap: token.marginXXS,
    alignItems: 'center',
  },
  composeBar: {
    marginTop: token.marginSM,
    paddingHorizontal: token.paddingSM,
    paddingVertical: token.paddingXS,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorFillQuaternary,
  },
  composeRow: {
    width: '100%',
    gap: token.sizeXS,
    alignItems: 'stretch',
  },
  composeItem: {
    flex: 1,
    minWidth: 0,
  },
  composeItemDivider: {
    borderLeftWidth: token.lineWidth,
    borderLeftColor: token.colorSplit,
    paddingLeft: token.paddingXS,
  },
  flowCard: {
    marginTop: token.marginSM,
    paddingHorizontal: token.paddingSM,
    paddingVertical: token.paddingXS,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorFillQuaternary,
  },
  routeRow: {
    gap: token.sizeXS,
    paddingVertical: token.paddingXXS,
  },
  routeDot: {
    width: token.sizeXS,
    height: token.sizeXS,
    borderRadius: token.sizeXS,
    backgroundColor: token.colorPrimary,
  },
  routeDotOutline: {
    backgroundColor: 'transparent',
    borderWidth: token.lineWidth,
    borderColor: token.colorPrimary,
  },
  routeLink: {
    width: token.lineWidth,
    height: token.sizeXS,
    marginLeft: token.sizeXS / 2,
    backgroundColor: token.colorBorder,
  },
  routeName: {
    flexShrink: 1,
  },
  flowDivider: {
    height: token.lineWidth,
    marginVertical: token.marginXXS,
    backgroundColor: token.colorSplit,
  },
  relatedBlock: {
    marginTop: token.marginSM,
  },
  relatedHead: {
    width: '100%',
    marginBottom: token.marginXXS,
  },
  relatedList: {
    borderTopWidth: token.lineWidth,
    borderTopColor: token.colorSplit,
  },
  relatedRow: {
    gap: token.sizeXS,
    paddingVertical: token.paddingXS,
    borderBottomWidth: token.lineWidth,
    borderBottomColor: token.colorSplit,
  },
  relatedRowLast: {
    borderBottomWidth: 0,
  },
  relatedMain: {
    flex: 1,
    minWidth: 0,
    gap: token.sizeXS,
  },
  relatedName: {
    flexShrink: 1,
  },
  metaWrap: {
    marginTop: token.marginSM,
    paddingTop: token.paddingXS,
    borderTopWidth: token.lineWidth,
    borderTopColor: token.colorSplit,
  },
  footerRow: {
    flex: 1,
    alignItems: 'center',
  },
  deleteButton: {
    height: token.controlHeight,
  },
  editButton: {
    flex: 1,
  },
}));
