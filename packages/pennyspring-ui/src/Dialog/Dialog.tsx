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
        borderRadius: token.borderRadius,
        backgroundColor: token.colorBgElevated,
      },
      header: {
        paddingHorizontal: token.paddingLG,
        paddingTop: token.paddingLG / 2,
        paddingBottom: token.paddingLG / 2,
        marginBottom: token.marginLG / 2,
        borderBottomWidth: token.lineWidth,
        borderBottomColor: token.colorBorderSecondary,
      },
      body: {
        paddingHorizontal: token.paddingLG,
        paddingVertical: token.paddingLG / 2,
      },
      footer: {
        paddingHorizontal: token.paddingLG,
        marginTop: token.marginLG / 2,
        paddingTop: token.paddingLG / 2,
        paddingBottom: token.paddingLG / 2,
        borderTopWidth: token.lineWidth,
        borderTopColor: token.colorBorderSecondary,
        gap: token.marginSM,
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
  animation,
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
      animation={animation}
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
      <Column style={[tokenStyles.panel, style]}>
        {titleNode ? (
          <Column style={[tokenStyles.header, slotStyles?.header]}>
            {titleNode}
          </Column>
        ) : null}
        <Column style={[tokenStyles.body, slotStyles?.body]}>
          {children}
        </Column>
        <Row gap="small" justify="end" style={[tokenStyles.footer, slotStyles?.footer]}>
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
