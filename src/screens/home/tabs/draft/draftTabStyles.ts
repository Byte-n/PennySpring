import { createUseSheetStyle, toShadowStyle } from '@pennyspring/ui';

const MISS_CHIP_HEIGHT = 24;
const MISS_CHIP_RADIUS = 999;
const MISS_CHIP_PADDING = 8;

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
  },
  progress: {
    flexShrink: 0,
  },
  items: {
    gap: token.marginXXS,
  },
  itemBlock: {
    gap: token.marginXXS / 2,
    paddingVertical: token.marginXXS / 2,
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
  itemMetaRow: {
    alignItems: 'center',
  },
  itemMeta: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
  },
  remark: {
    flexShrink: 1,
  },
  attachRow: {
    alignItems: 'center',
    gap: token.marginXS,
    minHeight: token.controlHeight,
    paddingTop: token.paddingXXS,
  },
  attachLabel: {
    flex: 1,
    minWidth: 0,
  },
  actions: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: token.paddingXXS,
  },
  missChip: {
    height: MISS_CHIP_HEIGHT,
    paddingHorizontal: MISS_CHIP_PADDING,
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
  fillOption: {
    minHeight: token.controlHeight,
    justifyContent: 'center',
    paddingHorizontal: token.paddingXS,
    paddingVertical: token.paddingXS,
    borderRadius: token.borderRadius,
    borderBottomWidth: token.lineWidth,
    borderBottomColor: token.colorSplit,
  },
  fillOptionLast: {
    borderBottomWidth: 0,
  },
  fillOptionPressed: {
    backgroundColor: token.colorFillQuaternary,
  },
  fillOptionDescription: {
    marginTop: token.marginXXS / 2,
  },
}));
