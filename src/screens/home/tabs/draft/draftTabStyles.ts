import { createUseSheetStyle, toShadowStyle } from '@pennyspring/ui';

const MISS_CHIP_RADIUS = 999;

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
    gap: token.marginXXS,
    padding: token.paddingSM,
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    borderWidth: token.lineWidth,
    borderColor: token.colorSplit,
    ...toShadowStyle(token.boxShadowTertiary),
  },
  cardMeta: {
    alignItems: 'baseline',
  },
  metaText: {
    flexShrink: 1,
    minWidth: 0,
  },
  cardTime: {
    flexShrink: 0,
  },
  progress: {
    flexShrink: 0,
  },
  summaryRow: {
    alignItems: 'flex-start',
    gap: token.marginXS,
  },
  summaryText: {
    flex: 1,
    minWidth: 0,
  },
  imageButton: {
    alignItems: 'center',
    backgroundColor: token.colorFillQuaternary,
    borderRadius: token.borderRadius,
    flexDirection: 'row',
    flexShrink: 0,
    gap: token.marginXXS / 2,
    height: token.controlHeightXS,
    paddingHorizontal: token.paddingXXS,
  },
  imageButtonPressed: {
    backgroundColor: token.colorFill,
  },
  items: {
    gap: token.marginXXS,
  },
  itemBlock: {
    gap: token.marginXXS / 2,
    paddingVertical: token.paddingXXS,
  },
  itemDivider: {
    borderTopWidth: token.lineWidth,
    borderTopColor: token.colorSplit,
  },
  itemRow: {
    alignItems: 'center',
  },
  itemCopy: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
  },
  itemType: {
    flexShrink: 1,
  },
  itemRight: {
    flexShrink: 0,
    alignItems: 'center',
  },
  num: {
    fontVariant: ['tabular-nums'],
  },
  inlinePressable: {
    flexShrink: 1,
    minWidth: 0,
  },
  amountPressable: {
    flexShrink: 0,
    minWidth: 0,
  },
  textPressed: {
    opacity: token.opacityLoading,
  },
  timeChip: {
    alignItems: 'center',
    backgroundColor: token.colorFillQuaternary,
    borderRadius: token.borderRadius,
    flexShrink: 0,
    height: token.controlHeightXS,
    justifyContent: 'center',
    paddingHorizontal: token.paddingXXS,
  },
  timeChipPressed: {
    backgroundColor: token.colorFillTertiary,
  },
  itemMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: token.marginXXS,
    marginTop: token.marginXXS / 2,
    overflow: 'hidden',
  },
  metaAsset: {
    flexShrink: 0,
  },
  metaCharge: {
    flexShrink: 0,
  },
  metaRemark: {
    flex: 1,
    minWidth: 0,
  },
  metaBadge: {
    alignItems: 'center',
    backgroundColor: token.colorWarningBg,
    borderRadius: MISS_CHIP_RADIUS,
    flexShrink: 0,
    height: token.controlHeightXS,
    justifyContent: 'center',
    paddingHorizontal: token.paddingXXS,
  },
  itemToolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: token.marginXS,
    marginTop: token.marginXXS,
    minWidth: 0,
  },
  itemTags: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: token.marginXXS,
    height: token.controlHeightXS,
    minWidth: 0,
    overflow: 'hidden',
  },
  itemTagsPressed: {
    opacity: token.opacityLoading,
  },
  tagChip: {
    alignItems: 'center',
    backgroundColor: token.colorFillQuaternary,
    borderRadius: token.borderRadius,
    flexShrink: 1,
    height: token.controlHeightXS,
    justifyContent: 'center',
    minWidth: 0,
    paddingHorizontal: token.paddingXXS,
  },
  tagText: {
    flexShrink: 1,
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: token.borderRadiusSM,
    flexShrink: 0,
    height: token.controlHeightXS,
    justifyContent: 'center',
    width: token.controlHeightXS,
  },
  iconButtonPressed: {
    backgroundColor: token.colorFill,
  },
  missChip: {
    height: token.controlHeightXS,
    paddingHorizontal: token.paddingXXS,
    borderRadius: MISS_CHIP_RADIUS,
    justifyContent: 'center',
    backgroundColor: token.colorWarningBg,
  },
  missChipDisabled: {
    opacity: token.opacityLoading,
  },
  missChipPressed: {
    backgroundColor: token.colorWarningBgHover,
  },
  warningRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: token.marginXXS / 2,
    marginTop: token.marginXXS,
  },
  warningText: {
    flex: 1,
    minWidth: 0,
  },
  totalRow: {
    alignItems: 'baseline',
    borderTopColor: token.colorSplit,
    borderTopWidth: token.lineWidth,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: token.marginXXS,
    justifyContent: 'space-between',
    marginTop: token.marginXXS,
    paddingTop: token.paddingXXS,
  },
  totalItems: {
    alignItems: 'baseline',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: token.marginXXS,
  },
  totalItem: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: token.marginXXS / 2,
  },
  totalAmount: {
    fontVariant: ['tabular-nums'],
  },
  totalNote: {
    flexShrink: 0,
  },
  attachStatic: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 0,
    gap: token.marginXXS / 2,
  },
  actions: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: token.paddingXXS,
  },
  hiddenTrigger: {
    display: 'none',
  },
}));
