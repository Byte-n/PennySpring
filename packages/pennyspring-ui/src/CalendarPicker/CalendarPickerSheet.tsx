import React, { useMemo } from 'react';
import { View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import { Popup } from '../Popup';
import { PickerHeader } from '../Picker/PickerHeader';
import { usePickerStyles } from '../Picker/usePickerStyles';
import type { ReactNode } from 'react';
import type {
  PickerPanelStyleSlots,
  PickerPopupStyleSlots,
} from '../shares/pickerStyles';
import type { ComponentSize } from '../shares/types';

const DEFAULT_CANCEL_TEXT = '取消';
const DEFAULT_OK_TEXT = '确定';

const useStyles = createUseSheetStyle(token => ({
  popupBody: {
    padding: 0,
    borderTopLeftRadius: token.borderRadiusLG,
    borderTopRightRadius: token.borderRadiusLG,
    backgroundColor: token.colorBgElevated,
  },
  panel: {
    backgroundColor: token.colorBgElevated,
    paddingHorizontal: token.padding,
  },
  handle: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: token.paddingXXS,
  },
  handleIndicator: {
    width: token.paddingXL,
    height: token.lineWidthBold,
    borderRadius: token.lineWidthBold,
    backgroundColor: token.colorFillSecondary,
  },
  safeArea: {
    height: token.paddingMD,
  },
}));

export interface CalendarPickerSheetProps {
  open: boolean;
  size: ComponentSize;
  titleText?: string;
  title?: ReactNode;
  cancelText?: string;
  cancel?: ReactNode;
  okText?: string;
  ok?: ReactNode;
  okDisabled?: boolean;
  panelStyles?: PickerPanelStyleSlots;
  popupStyles?: PickerPopupStyleSlots;
  onMaskPress: () => void;
  onCancelPress: () => void;
  onOkPress: () => void;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

/**
 * 日历族共用的底部浮层骨架：浮层 + 顶部手柄 + 头部操作 + 内容 + 底部安全区。
 */
export function CalendarPickerSheet({
  cancel,
  cancelText,
  children,
  ok,
  okDisabled,
  okText,
  onCancelPress,
  onMaskPress,
  onOkPress,
  onOpenChange,
  open,
  panelStyles,
  popupStyles,
  size,
  title,
  titleText,
}: CalendarPickerSheetProps) {
  const styleOptions = useMemo(() => ({ size }), [size]);
  const pickerStyles = usePickerStyles(styleOptions);
  const styles = useStyles();

  return (
    <Popup
      animation="fade"
      onCancel={onMaskPress}
      onOpenChange={nextOpen => {
        if (nextOpen) {
          return;
        }

        onOpenChange?.(false);
      }}
      open={open}
      position="bottom"
      styles={{
        body: [styles.popupBody, popupStyles?.container],
        mask: popupStyles?.mask,
      }}
    >
      <View style={[styles.panel, panelStyles?.root]}>
        <View style={[styles.handle, popupStyles?.handle]}>
          <View style={[styles.handleIndicator, popupStyles?.handleIndicator]} />
        </View>
        <PickerHeader
          cancel={cancel}
          cancelText={cancelText ?? DEFAULT_CANCEL_TEXT}
          ok={ok}
          okDisabled={okDisabled}
          okText={okText ?? DEFAULT_OK_TEXT}
          onCancelPress={onCancelPress}
          onOkPress={onOkPress}
          size={size}
          slotStyles={panelStyles?.header}
          styles={pickerStyles}
          title={title}
          titleText={titleText}
        />
        {children}
        <View style={[styles.safeArea, panelStyles?.safeArea]} />
      </View>
    </Popup>
  );
}
