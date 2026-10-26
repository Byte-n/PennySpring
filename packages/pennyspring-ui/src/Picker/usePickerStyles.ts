import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { TextStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';

interface PickerStyleOptions {
  size: ComponentSize;
}

export const WHEEL_VISIBLE_ITEM_COUNT = 5;
export const MIN_WHEEL_VISIBLE_ITEM_COUNT = 3;
const WHEEL_SIDE_ITEM_COUNT = 2;
const INDICATOR_Z_INDEX_OFFSET = 1;

export function getPickerItemHeight(
  size: ComponentSize,
  token: AliasToken,
): number {
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
    const itemHeight = getPickerItemHeight(size, token);
    const wheelInset = itemHeight * WHEEL_SIDE_ITEM_COUNT;

    return {
      popup: {
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: token.zIndexPopupBase,
      },
      popupContent: {
        padding: 0,
      },
      popupPanelBody: {
        flexGrow: 1,
        padding: 0,
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
      },
      headerActions: {
        flexShrink: 0,
        gap: token.marginXS,
      },
      headerButton: {
        minHeight: token.controlHeightSM,
        justifyContent: 'center',
        borderRadius: token.borderRadiusSM,
      },
      titleContainer: {
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingHorizontal: token.paddingSM,
      },
      titleText: {
        color: token.colorTextHeading,
      },
      body: {
        flex: 1,
        paddingVertical: token.paddingSM / 2,
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
