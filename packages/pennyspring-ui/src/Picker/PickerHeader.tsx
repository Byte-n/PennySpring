import React from 'react';
import { View } from 'react-native';
import { PickerHeaderButton } from './PickerHeaderButton';
import { PickerTitle } from './PickerTitle';
import { Row } from '../Row';
import type { ComponentSize } from '../shares/types';
import type { PickerHeaderStyles, PickerPopupProps } from './types';

interface PickerHeaderProps {
  cancel?: PickerPopupProps['cancel'];
  cancelText?: PickerPopupProps['cancelText'];
  ok?: PickerPopupProps['ok'];
  okText?: PickerPopupProps['okText'];
  okDisabled?: boolean;
  size?: ComponentSize;
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
  size,
  slotStyles,
  styles,
  title,
  titleText,
}: PickerHeaderProps) {
  return (
    <Row align="center" style={styles.header} testID="picker-header">
      <View style={styles.headerSide} testID="picker-header-cancel-side">
        <PickerHeaderButton
          content={cancel}
          onPress={onCancelPress}
          size={size}
          style={[styles.headerButton, slotStyles?.cancelButton]}
          testID="picker-cancel-button"
          text={cancelText}
          textStyle={[styles.headerButtonText, slotStyles?.cancelText]}
        />
      </View>
      <View style={styles.headerCenter} testID="picker-header-title-center">
        <PickerTitle
          slotStyles={slotStyles}
          styles={styles}
          title={title}
          titleText={titleText}
        />
      </View>
      <View style={[styles.headerSide, styles.headerSideEnd]} testID="picker-header-ok-side">
        <PickerHeaderButton
          content={ok}
          disabled={okDisabled}
          onPress={onOkPress}
          size={size}
          style={[styles.headerButton, slotStyles?.okButton]}
          testID="picker-ok-button"
          text={okText}
          textStyle={[styles.headerButtonText, slotStyles?.okText]}
        />
      </View>
    </Row>
  );
}
