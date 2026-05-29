import { createUseSheetStyle } from '@pennyspring/theme';

export interface ImagePickerStyleOptions {
  disabled: boolean;
  maxReached: boolean;
  selected: boolean;
}

const IMAGE_THUMBNAIL_SIZE_MULTIPLIER = 2;

export const useStyles = createUseSheetStyle<ImagePickerStyleOptions>(
  (token, { disabled, maxReached, selected }) => ({
    triggerField: {
      backgroundColor: selected ? token.colorPrimaryBg : token.colorFillTertiary,
      opacity: disabled ? token.opacityLoading : undefined,
    },
    triggerUnderline: {
      backgroundColor: selected ? token.colorPrimaryBorder : token.colorBorder,
    },
    iconContainer: {
      paddingHorizontal: token.paddingXXS,
      paddingVertical: token.paddingXXS / 2,
      borderRadius: token.borderRadiusXS,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: selected ? token.colorPrimary : token.colorFillTertiary,
    },
    statusText: {
      color: selected ? token.colorPrimaryText : token.colorTextSecondary,
    },
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
    actionButton: {
      opacity: maxReached ? token.opacityLoading : undefined,
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
  }),
);
