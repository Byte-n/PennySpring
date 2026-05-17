import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { TextStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';

interface PickerStyleOptions {
  size: ComponentSize;
}

export const WHEEL_VISIBLE_ITEM_COUNT = 5;
const WHEEL_SIDE_ITEM_COUNT = 2;
const INDICATOR_Z_INDEX_OFFSET = 1;

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
  (token, { size }: PickerStyleOptions) => {
    const itemHeight = getItemHeight(size, token);
    const wheelInset = itemHeight * WHEEL_SIDE_ITEM_COUNT;

    return {
      trigger: {
        alignSelf: 'stretch',
      },
    triggerClearButton: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: token.paddingXXS,
      borderRadius: token.borderRadiusSM,
    },
    triggerClearButtonPressed: {
      backgroundColor: token.colorFillTertiary,
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
      flex: 1,
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
      flex: 1,
      paddingVertical: token.paddingSM,
    },
    view: {
      flex: 1,
      flexDirection: 'row',
      position: 'relative',
    },
    column: {
      flex: 1,
    },
    columnScroll: {
      height: itemHeight * WHEEL_VISIBLE_ITEM_COUNT,
    },
    columnContent: {
      paddingVertical: wheelInset,
    },
    item: {
      minHeight: itemHeight,
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
      position: 'absolute',
      top: wheelInset,
      left: 0,
      right: 0,
      height: itemHeight,
      zIndex: token.zIndexBase + INDICATOR_Z_INDEX_OFFSET,
      borderTopWidth: token.lineWidth,
      borderBottomWidth: token.lineWidth,
      borderColor: token.colorBorderSecondary,
    },
    indicatorError: {
      borderColor: token.colorErrorBorder,
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
      flex: 1,
      paddingBottom: token.paddingMD,
    },
    };
  },
);
