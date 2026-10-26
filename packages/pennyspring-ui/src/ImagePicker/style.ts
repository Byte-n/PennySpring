import { createUseSheetStyle } from '@pennyspring/theme';

const IMAGE_THUMBNAIL_SIZE_MULTIPLIER = 2;

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
  imageGrid: {
    gap: token.marginSM,
    paddingHorizontal: token.paddingLG,
    paddingVertical: token.paddingLG / 2,
  },
  imageItem: {
    width: token.controlHeightLG * IMAGE_THUMBNAIL_SIZE_MULTIPLIER,
    height: token.controlHeightLG * IMAGE_THUMBNAIL_SIZE_MULTIPLIER,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorFillTertiary,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: token.borderRadius,
  },
  removeButton: {
    position: 'absolute',
    top: -token.marginXXS,
    right: -token.marginXXS,
    width: token.controlHeightXS,
    height: token.controlHeightXS,
    borderRadius: token.controlHeightXS,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: token.colorBgSpotlight,
  },
  empty: {
    minHeight: token.controlHeightLG * IMAGE_THUMBNAIL_SIZE_MULTIPLIER,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: token.paddingLG,
    paddingVertical: token.paddingLG / 2,
  },
  emptyText: {
    color: token.colorTextTertiary,
  },
}));
