import React from 'react';
import { createUseSheetStyle } from '@pennyspring/theme';
import { Button } from '../Button';
import { Column } from '../Column';
import { Popup } from '../Popup';
import { Row } from '../Row';
import { Text } from '../Text';
import { useControllableValue } from '../_hooks';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type {
  DialogCancelReason,
  DialogOpenChangeReason,
  DialogProps,
} from './types';

const DEFAULT_CANCEL_TEXT = '取消';
const DEFAULT_OK_TEXT = '确定';

const useStyles = createUseSheetStyle(
  token => {
    return {
      popupBody: {
        padding: 0,
        width: '85%',
      },
      panel: {
        padding: token.paddingMD,
        borderRadius: token.borderRadius,
        backgroundColor: token.colorBgElevated,
      },
    };
  },
);

function renderTitle(
  title: DialogProps['title'],
  titleText: DialogProps['titleText'],
  titleTextStyle: StyleProp<TextStyle>,
) {
  if (title !== undefined && title !== null) {
    return title;
  }

  if (titleText === undefined) {
    return null;
  }

  return (
    <Text
      color="heading"
      size="lg"
      style={titleTextStyle}
      testID="dialog-title-text"
      weight="strong"
    >
      {titleText}
    </Text>
  );
}

function renderAction(
  content: React.ReactNode,
  text: string,
  style: StyleProp<ViewStyle>,
  onPress: () => void,
  testID: string,
  disabled = false,
) {
  if (content !== undefined && content !== null) {
    return (
      <Button
        disabled={disabled}
        onPress={onPress}
        style={style}
        testID={testID}
      >
        {content}
      </Button>
    );
  }

  return (
    <Button
      disabled={disabled}
      onPress={onPress}
      style={style}
      testID={testID}
    >
      {text}
    </Button>
  );
}

export function Dialog({
  afterOpenChange,
  cancel,
  cancelText = DEFAULT_CANCEL_TEXT,
  children,
  closeOnMaskClick = true,
  defaultOpen,
  mask = true,
  mountPoint,
  ok,
  okDisabled = false,
  okText = DEFAULT_OK_TEXT,
  onCancel,
  onOk,
  onOpenChange,
  open,
  style,
  styles: slotStyles,
  title,
  titleText,
}: DialogProps) {
  const tokenStyles = useStyles();
  const [resolvedOpen, setResolvedOpen] = useControllableValue(
    defaultOpen === true,
    open,
    undefined,
  );
  const isOpen = resolvedOpen === true;
  const titleNode = renderTitle(title, titleText, slotStyles?.titleText);

  const closeInternal = (reason: DialogOpenChangeReason): void => {
    setResolvedOpen(false);
    onOpenChange?.(false, { reason });
  };

  const cancelInternal = (reason: DialogCancelReason): void => {
    onCancel?.({ reason });
    closeInternal(reason);
  };

  const handleCancelPress = (): void => {
    cancelInternal('cancel');
  };

  const handleOkPress = (): void => {
    if (okDisabled) {
      return;
    }

    onOk?.();
    closeInternal('ok');
  };

  return (
    <Popup
      afterOpenChange={afterOpenChange}
      closeOnMaskClick={closeOnMaskClick}
      defaultOpen={defaultOpen}
      mask={mask}
      mountPoint={mountPoint}
      onCancel={params => cancelInternal(params.reason)}
      open={isOpen}
      position="center"
      styles={{
        mask: slotStyles?.mask,
        body: tokenStyles.popupBody,
      }}
    >
      <Column gap="normal" style={[tokenStyles.panel, style]}>
        {titleNode ? (
          <Column gap="small" style={slotStyles?.header}>
            {titleNode}
          </Column>
        ) : null}
        <Column gap="small" style={slotStyles?.body}>
          {children}
        </Column>
        <Row gap="small" justify="end" style={slotStyles?.footer}>
          {renderAction(
            cancel,
            cancelText,
            slotStyles?.cancelButton,
            handleCancelPress,
            'dialog-cancel-button',
          )}
          {renderAction(
            ok,
            okText,
            slotStyles?.okButton,
            handleOkPress,
            'dialog-ok-button',
            okDisabled,
          )}
        </Row>
      </Column>
    </Popup>
  );
}
