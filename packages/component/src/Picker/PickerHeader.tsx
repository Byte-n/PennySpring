import React from 'react';
import { View } from 'react-native';
import { PickerHeaderButton } from './PickerHeaderButton';
import { PickerTitle } from './PickerTitle';
import type { PickerProps } from './types';

interface PickerHeaderProps {
  cancel?: PickerProps['cancel'];
  cancelText?: PickerProps['cancelText'];
  ok?: PickerProps['ok'];
  okText?: PickerProps['okText'];
  okDisabled?: boolean;
  title?: PickerProps['title'];
  titleText?: PickerProps['titleText'];
  onCancelPress?: () => void;
  onOkPress?: () => void;
  styles: ReturnType<typeof import('./usePickerStyles').usePickerStyles>;
  slotStyles?: PickerProps['styles'];
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
    <View style={[styles.header, slotStyles?.header]}>
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
