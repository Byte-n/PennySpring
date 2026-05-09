import React, { useState } from 'react';
import { View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import { Button } from '../Button';
import { Popup } from '../Popup';
import { Text } from '../Text';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type {
  DialogCancelReason,
  DialogOpenChangeReason,
  DialogProps,
} from './types';

const DEFAULT_CANCEL_TEXT = 'Cancel';
const DEFAULT_OK_TEXT = 'OK';
const DIALOG_WIDTH_PERCENT = '82%';

const useStyles = createUseSheetStyle(
  token => {
    return {
      popup: {
        zIndex: token.zIndexPopupBase + token.zIndexBase + 200,
      },
      popupBody: {
        padding: 0,
      },
      panel: {
        width: DIALOG_WIDTH_PERCENT,
        padding: token.paddingMD,
        gap: token.sizeMD,
        borderRadius: token.borderRadius,
        backgroundColor: token.colorBgElevated,
      },
      header: {
        gap: token.sizeXS,
      },
      titleText: {
        color: token.colorTextHeading,
        fontSize: token.fontSizeLG,
        lineHeight: token.lineHeightLG,
        fontWeight: String(token.fontWeightStrong) as TextStyle['fontWeight'],
      },
      body: {
        gap: token.sizeSM,
      },
      footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: token.sizeSM,
      },
    };
  },
);

function resolveOpen(defaultOpen?: boolean, open?: boolean): boolean {
  return open ?? defaultOpen ?? false;
}

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
    <Text style={titleTextStyle} testID="dialog-title-text">
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
  const [internalOpen, setInternalOpen] = useState(resolveOpen(defaultOpen, open));
  const isOpenControlled = open !== undefined;
  const isOpen = isOpenControlled ? open : internalOpen;
  const titleNode = renderTitle(title, titleText, [
    tokenStyles.titleText,
    slotStyles?.titleText,
  ]);

  const closeInternal = (reason: DialogOpenChangeReason): void => {
    if (!isOpenControlled) {
      setInternalOpen(false);
    }

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
      style={tokenStyles.popup}
      styles={{
        mask: slotStyles?.mask,
        body: tokenStyles.popupBody,
      }}
    >
      <View style={[tokenStyles.panel, style]} testID="dialog-panel">
        {titleNode ? (
          <View style={[tokenStyles.header, slotStyles?.header]} testID="dialog-header">
            {titleNode}
          </View>
        ) : null}
        <View style={[tokenStyles.body, slotStyles?.body]} testID="dialog-body">
          {children}
        </View>
        <View style={[tokenStyles.footer, slotStyles?.footer]} testID="dialog-footer">
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
        </View>
      </View>
    </Popup>
  );
}
