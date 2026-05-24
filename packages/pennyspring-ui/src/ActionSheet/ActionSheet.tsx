import React from 'react';
import { View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import { Button } from '../Button';
import { Popup } from '../Popup';
import { Text } from '../Text';
import { useControllableValue } from '../_hooks';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type {
  ActionSheetAction,
  ActionSheetCancelReason,
  ActionSheetOpenChangeReason,
  ActionSheetProps,
} from './types';

const useStyles = createUseSheetStyle(token => {
  return {
    body: {
      padding: 0,
      borderTopLeftRadius: token.borderRadiusLG,
      borderTopRightRadius: token.borderRadiusLG,
    },
    titleContainer: {
      padding: token.paddingMD,
      paddingBottom: token.paddingSM,
      alignItems: 'center',
    },
    titleText: {
      color: token.colorTextHeading,
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
    },
    actionsContainer: {
      padding: token.paddingSM,
    },
    action: {
      padding: token.paddingMD,
      alignItems: 'center',
    },
    actionContent: {
      alignItems: 'center',
    },
    actionText: {
      color: token.colorText,
      fontSize: token.fontSizeLG,
      lineHeight: token.lineHeightLG,
    },
    actionDescription: {
      color: token.colorTextSecondary,
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
      marginTop: token.marginXXS,
    },
    dangerActionText: {
      color: token.colorError,
    },
    disabledActionText: {
      color: token.colorTextDisabled,
    },
    cancelButtonContainer: {
      padding: token.paddingSM,
      paddingTop: 0,
    },
    cancelButton: {
      padding: token.paddingMD,
      alignItems: 'center',
      backgroundColor: token.colorBgElevated,
      borderTopLeftRadius: token.borderRadiusLG,
      borderTopRightRadius: token.borderRadiusLG,
    },
    cancelButtonText: {
      color: token.colorText,
      fontSize: token.fontSizeLG,
      lineHeight: token.lineHeightLG,
    },
    separator: {
      height: token.lineWidth,
      backgroundColor: token.colorBorderSecondary,
    },
  };
});

function renderTitle(
  title: ActionSheetProps['title'],
  titleText: ActionSheetProps['titleText'],
  titleTextStyle: StyleProp<TextStyle>,
) {
  if (title !== undefined && title !== null) {
    return title;
  }

  if (titleText === undefined) {
    return null;
  }

  return (
    <View testID="action-sheet-title-container">
      <Text style={titleTextStyle} testID="action-sheet-title-text">
        {titleText}
      </Text>
    </View>
  );
}

function renderAction(
  action: ActionSheetAction,
  index: number,
  actionContainerStyle: StyleProp<ViewStyle>,
  actionContentStyle: StyleProp<ViewStyle>,
  actionTextStyle: StyleProp<TextStyle>,
  actionDescriptionStyle: StyleProp<TextStyle>,
  dangerActionTextStyle: StyleProp<TextStyle>,
  disabledActionTextStyle: StyleProp<TextStyle>,
  onAction?: (action: ActionSheetAction, index: number) => void,
) {
  const handlePress = (): void => {
    if (action.disabled) {
      return;
    }
    onAction?.(action, index);
  };

  const textStyle = [
    actionTextStyle,
    action.danger && dangerActionTextStyle,
    action.disabled && disabledActionTextStyle,
  ];

  return (
    <Button
      disabled={action.disabled}
      key={index}
      onPress={handlePress}
      style={actionContainerStyle}
      testID={`action-sheet-action-${index}`}
      type="text"
    >
      <View style={actionContentStyle}>
        <Text style={textStyle}>{action.text}</Text>
        {action.description ? (
          <Text style={actionDescriptionStyle}>{action.description}</Text>
        ) : null}
      </View>
    </Button>
  );
}

export function ActionSheet({
  afterOpenChange,
  actions,
  cancel,
  cancelText,
  closeOnMaskClick = true,
  defaultOpen,
  mask = true,
  mountPoint,
  onCancel,
  onAction,
  onOpenChange,
  open,
  style,
  styles: slotStyles,
  title,
  titleText,
}: ActionSheetProps) {
  const tokenStyles = useStyles();
  const [resolvedOpen, setResolvedOpen] = useControllableValue(
    defaultOpen === true,
    open,
    undefined,
  );
  const isOpen = resolvedOpen === true;
  const titleNode = renderTitle(title, titleText, [
    tokenStyles.titleText,
    slotStyles?.titleText,
  ]);

  const closeInternal = (reason: ActionSheetOpenChangeReason): void => {
    setResolvedOpen(false);
    onOpenChange?.(false, { reason });
  };

  const cancelInternal = (reason: ActionSheetCancelReason): void => {
    onCancel?.({ reason });
    closeInternal(reason);
  };

  const handleCancelPress = (): void => {
    cancelInternal('cancel');
  };

  const handleActionPress = (action: ActionSheetAction, index: number): void => {
    onAction?.(action, index);
    closeInternal('action');
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
      position="bottom"
      style={tokenStyles.body}
      styles={{
        mask: slotStyles?.mask,
        body: slotStyles?.body,
      }}
    >
      <View style={style} testID="action-sheet-panel">
        {titleNode ? (
          <View style={tokenStyles.titleContainer} testID="action-sheet-title-container">
            {titleNode}
          </View>
        ) : null}
        <View style={tokenStyles.actionsContainer} testID="action-sheet-actions-container">
          {actions.map((action, index) =>
            renderAction(
              action,
              index,
              tokenStyles.action,
              tokenStyles.actionContent,
              tokenStyles.actionText,
              tokenStyles.actionDescription,
              tokenStyles.dangerActionText,
              tokenStyles.disabledActionText,
              handleActionPress,
            ),
          )}
        </View>
        {cancelText || cancel ? (
          <View style={tokenStyles.cancelButtonContainer} testID="action-sheet-cancel-container">
            <View style={tokenStyles.separator} />
            <Button
              onPress={handleCancelPress}
              style={tokenStyles.cancelButton}
              styles={{ content: [tokenStyles.cancelButtonText, slotStyles?.cancelButtonText] }}
              testID="action-sheet-cancel-button"
              type="text"
            >
              {cancel !== undefined && cancel !== null ? (
                cancel
              ) : (
                <Text
                  style={[tokenStyles.cancelButtonText, slotStyles?.cancelButtonText]}
                  testID="action-sheet-cancel-text"
                >
                  {cancelText}
                </Text>
              )}
            </Button>
          </View>
        ) : null}
      </View>
    </Popup>
  );
}
