import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { TextStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';

interface PickerStyleOptions {
  size: ComponentSize;
}

function getItemHeight(size: ComponentSize, token: AliasToken): number {
  if (size === 'small') {
    return token.controlHeightSM;
  }

  if (size === 'large') {
    return token.controlHeightLG;
  }

  return token.controlHeight;
}

export const usePickerStyles = createUseSheetStyle(
  (token, { size }: PickerStyleOptions) => ({
    trigger: {
      alignSelf: 'stretch',
    },
    popup: {
      ...({
        ...{},
      }),
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: token.zIndexPopupBase,
    },
    mask: {
      backgroundColor: token.colorBgMask,
    },
    panel: {
      backgroundColor: token.colorBgElevated,
      borderTopLeftRadius: token.borderRadiusLG,
      borderTopRightRadius: token.borderRadiusLG,
    },
    header: {
      minHeight: token.controlHeight,
      paddingHorizontal: token.paddingMD,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: token.lineWidth,
      borderBottomColor: token.colorSplit,
    },
    headerButton: {
      minHeight: token.controlHeightSM,
      justifyContent: 'center',
      paddingHorizontal: token.paddingSM,
      borderRadius: token.borderRadiusSM,
    },
    headerButtonText: {
      color: token.colorPrimaryText,
    },
    titleContainer: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: token.paddingSM,
    },
    titleText: {
      color: token.colorTextHeading,
      fontWeight: String(token.fontWeightStrong) as TextStyle['fontWeight'],
    },
    body: {
      paddingVertical: token.paddingSM,
    },
    view: {
      flexDirection: 'row',
    },
    column: {
      flex: 1,
    },
    item: {
      minHeight: getItemHeight(size, token),
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: token.paddingSM,
    },
    itemText: {
      color: token.colorText,
    },
    selectedItem: {
      backgroundColor: token.controlItemBgActive,
    },
    selectedItemText: {
      color: token.colorPrimaryText,
      fontWeight: String(token.fontWeightStrong) as TextStyle['fontWeight'],
    },
    disabledItem: {
      backgroundColor: token.colorBgContainerDisabled,
    },
    disabledItemText: {
      color: token.colorTextDisabled,
    },
    indicator: {
      borderTopWidth: token.lineWidth,
      borderBottomWidth: token.lineWidth,
      borderColor: token.colorBorderSecondary,
    },
    loading: {
      minHeight: token.controlHeight,
      alignItems: 'center',
      justifyContent: 'center',
      padding: token.paddingMD,
    },
    empty: {
      minHeight: token.controlHeight,
      alignItems: 'center',
      justifyContent: 'center',
      padding: token.paddingMD,
    },
    safeArea: {
      paddingBottom: token.paddingMD,
    },
  }),
);
