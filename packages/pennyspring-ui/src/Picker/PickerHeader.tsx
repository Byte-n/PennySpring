import React from 'react';
import { PickerHeaderButton } from './PickerHeaderButton';
import { PickerTitle } from './PickerTitle';
import { Row } from '../Row';
import { Spacer } from '../Spacer';
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
      <PickerTitle
        slotStyles={slotStyles}
        styles={styles}
        title={title}
        titleText={titleText}
      />
      <Spacer />
      <Row
        align="center"
        style={styles.headerActions}
        testID="picker-header-actions"
      >
        <PickerHeaderButton
          danger
          content={cancel}
          onPress={onCancelPress}
          size={size}
          style={[styles.headerButton, slotStyles?.cancelButton]}
          testID="picker-cancel-button"
          text={cancelText}
          textStyle={slotStyles?.cancelText}
        />
        <PickerHeaderButton
          color="primary"
          content={ok}
          disabled={okDisabled}
          onPress={onOkPress}
          size={size}
          style={[styles.headerButton, slotStyles?.okButton]}
          testID="picker-ok-button"
          text={okText}
          textStyle={slotStyles?.okText}
        />
      </Row>
    </Row>
  );
}
