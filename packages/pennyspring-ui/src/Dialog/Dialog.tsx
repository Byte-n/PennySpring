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
const DIALOG_MAX_WIDTH = 300;

const useStyles = createUseSheetStyle(token => {
  return {
    popupBody: {
      maxWidth: DIALOG_MAX_WIDTH,
      padding: 0,
      width: '85%',
    },
    panel: {
      backgroundColor: token.colorBgElevated,
      borderRadius: token.borderRadiusLG,
      overflow: 'hidden',
    },
    header: {
      paddingHorizontal: token.padding,
      paddingTop: token.padding,
      paddingBottom: token.paddingXS,
    },
    body: {
      paddingHorizontal: token.padding,
      paddingVertical: token.paddingXS,
    },
    footer: {
      gap: token.marginSM,
      paddingBottom: token.padding,
      paddingHorizontal: token.padding,
      paddingTop: token.paddingXS,
    },
    footerButton: {
      borderRadius: token.borderRadiusSM,
    },
  };
});

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
      size="md"
      style={titleTextStyle}
      testID="dialog-title-text"
      weight="semibold"
    >
      {titleText}
    </Text>
  );
}

function renderAction(
  content: React.ReactNode,
  text: string,
  style: StyleProp<ViewStyle>,
  buttonStyle: StyleProp<ViewStyle>,
  onPress: () => void,
  testID: string,
  type: 'default' | 'primary' | 'danger',
  disabled = false,
) {
  const buttonStyleList = [buttonStyle, style];

  if (content !== undefined && content !== null) {
    return (
      <Button
        disabled={disabled}
        onPress={onPress}
        style={buttonStyleList}
        testID={testID}
        type={type}
      >
        {content}
      </Button>
    );
  }

  return (
    <Button
      disabled={disabled}
      onPress={onPress}
      style={buttonStyleList}
      testID={testID}
      type={type}
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
  okDanger = false,
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

  const handleOkPress = async (): Promise<void> => {
    if (okDisabled) {
      return;
    }

    try {
      const result = await onOk?.();
      if (result !== false) {
        closeInternal('ok');
      }
    } catch {
      // 失败时保持弹窗打开，由调用方在内容区展示原因
    }
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
        <Column style={[tokenStyles.body, slotStyles?.body]}>{children}</Column>
        <Row
          gap="small"
          justify="end"
          style={[tokenStyles.footer, slotStyles?.footer]}
        >
          {renderAction(
            cancel,
            cancelText,
            slotStyles?.cancelButton,
            tokenStyles.footerButton,
            handleCancelPress,
            'dialog-cancel-button',
            'default',
          )}
          {renderAction(
            ok,
            okText,
            slotStyles?.okButton,
            tokenStyles.footerButton,
            handleOkPress,
            'dialog-ok-button',
            okDanger ? 'danger' : 'primary',
            okDisabled,
          )}
        </Row>
      </Column>
    </Popup>
  );
}
