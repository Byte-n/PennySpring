import React from 'react';
import { View } from 'react-native';
import { PickerHeaderButton } from './PickerHeaderButton';
import { PickerTitle } from './PickerTitle';
import type { PickerHeaderStyles, PickerPopupProps } from './types';

interface PickerHeaderProps {
  cancel?: PickerPopupProps['cancel'];
  cancelText?: PickerPopupProps['cancelText'];
  ok?: PickerPopupProps['ok'];
  okText?: PickerPopupProps['okText'];
  okDisabled?: boolean;
  title?: PickerPopupProps['title'];
  titleText?: PickerPopupProps['titleText'];
  onCancelPress?: () => void;
  onOkPress?: () => void;
  styles: ReturnType<typeof import('./usePickerStyles').usePickerStyles>;
  slotStyles?: PickerHeaderStyles;
}

export function PickerHeader({
  cancel,
  cancelText,
  ok,
  okDisabled,
  okText,
  onCancelPress,
  onOkPress,
  slotStyles,
  styles,
  title,
  titleText,
}: PickerHeaderProps) {
  return (
    <View style={styles.header}>
      <PickerHeaderButton
        content={cancel}
        onPress={onCancelPress}
        style={[styles.headerButton, slotStyles?.cancelButton]}
        testID="picker-cancel-button"
        text={cancelText}
        textStyle={[styles.headerButtonText, slotStyles?.cancelText]}
      />
      <PickerTitle
        slotStyles={slotStyles}
        styles={styles}
        title={title}
        titleText={titleText}
      />
      <PickerHeaderButton
        content={ok}
        disabled={okDisabled}
        onPress={onOkPress}
        style={[styles.headerButton, slotStyles?.okButton]}
        testID="picker-ok-button"
        text={okText}
        textStyle={[styles.headerButtonText, slotStyles?.okText]}
      />
    </View>
  );
}
