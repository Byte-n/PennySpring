import { createUseSheetStyle } from '@pennyspring/theme';

const REMOVE_BUTTON_OFFSET = -6;
const EMPTY_MIN_HEIGHT = 120;

export const useStyles = createUseSheetStyle(token => ({
  popup: {
    backgroundColor: token.colorBgContainer,
  },
  popupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: token.marginSM,
  },
  popupTitleArea: {
    flex: 1,
    gap: token.marginXXS,
  },
  popupTitle: {
    color: token.colorTextHeading,
  },
  popupSubtitle: {
    color: token.colorTextSecondary,
  },
  popupActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: token.marginXS,
  },
  popupBody: {
    paddingHorizontal: 0,
  },
  countText: {
    color: token.colorTextTertiary,
  },
  imageGrid: {
    gap: token.sizeXS,
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingSM,
  },
  imageItem: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorFillTertiary,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: token.borderRadius,
  },
  errorTile: {
    borderWidth: token.lineWidth,
    borderStyle: 'dashed',
    borderColor: token.colorError,
    backgroundColor: token.colorFillQuaternary,
  },
  errorText: {
    color: token.colorError,
  },
  removeButton: {
    position: 'absolute',
    top: REMOVE_BUTTON_OFFSET,
    right: REMOVE_BUTTON_OFFSET,
    width: token.sizeLG,
    height: token.sizeLG,
    borderRadius: token.sizeLG,
    borderWidth: token.lineWidthBold,
    borderColor: token.colorBgContainer,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: token.colorBgSpotlight,
  },
  addTile: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: token.sizeXXS,
    borderRadius: token.borderRadius,
    borderWidth: token.lineWidth,
    borderStyle: 'dashed',
    borderColor: token.colorBorder,
    backgroundColor: 'transparent',
  },
  addTileText: {
    color: token.colorTextTertiary,
  },
  empty: {
    minHeight: EMPTY_MIN_HEIGHT,
    marginHorizontal: token.padding,
    marginTop: token.paddingSM,
    alignItems: 'center',
    justifyContent: 'center',
    gap: token.paddingXS,
    borderRadius: token.borderRadius,
    borderWidth: token.lineWidth,
    borderStyle: 'dashed',
    borderColor: token.colorBorder,
  },
  emptyText: {
    color: token.colorTextTertiary,
  },
}));
