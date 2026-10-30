import React from 'react';
import { Pressable } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import { Column } from '../Column';
import { Icon } from '../Icon';
import { Popup } from '../Popup';
import { Text } from '../Text';
import { useControllableValue } from '../_hooks';
import type { StyleProp, TextStyle } from 'react-native';
import type {
  ActionSheetAction,
  ActionSheetCancelReason,
  ActionSheetOpenChangeReason,
  ActionSheetProps,
} from './types';

const useStyles = createUseSheetStyle(token => {
  return {
    body: {
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      paddingBottom: token.paddingSM,
      paddingHorizontal: token.paddingSM,
    },
    popupBody: {
      backgroundColor: 'transparent',
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      padding: 0,
      shadowColor: 'transparent',
    },
    panel: {
      gap: token.marginSM,
    },
    group: {
      backgroundColor: token.colorBgContainer,
      borderRadius: token.borderRadiusLG,
      overflow: 'hidden',
    },
    titleContainer: {
      alignItems: 'center',
      borderBottomColor: token.colorSplit,
      borderBottomWidth: token.lineWidth,
      paddingHorizontal: token.padding,
      paddingVertical: token.paddingSM,
    },
    titleText: {
      color: token.colorTextTertiary,
      fontSize: token.fontSizeXS,
      lineHeight: token.lineHeightXS,
    },
    action: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: token.marginXS,
      height: token.controlHeightLG,
      justifyContent: 'center',
    },
    actionPressed: {
      backgroundColor: token.colorFillQuaternary,
    },
    actionContent: {
      alignItems: 'center',
    },
    actionText: {
      color: token.colorText,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
    },
    actionDescription: {
      color: token.colorTextSecondary,
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
    },
    dangerActionText: {
      color: token.colorErrorText,
    },
    disabledActionText: {
      color: token.colorTextDisabled,
    },
    actionSeparator: {
      backgroundColor: token.colorSplit,
      height: token.lineWidth,
    },
    cancelButtonContainer: {},
    cancelButton: {
      alignItems: 'center',
      backgroundColor: token.colorBgContainer,
      borderRadius: token.borderRadiusLG,
      height: token.controlHeightLG,
      justifyContent: 'center',
    },
    cancelButtonPressed: {
      backgroundColor: token.colorFillQuaternary,
    },
    cancelButtonText: {
      color: token.colorText,
      fontSize: token.fontSize,
      fontWeight: String(token.fontWeightSemiBold) as TextStyle['fontWeight'],
      lineHeight: token.lineHeight,
    },
  };
});

function renderTitle(
  title: ActionSheetProps['title'],
  titleText: ActionSheetProps['titleText'],
  titleTextStyle: StyleProp<TextStyle>,
) {
  if (title === null) {
    return null;
  }

  if (title !== undefined) {
    return title;
  }

  if (titleText === undefined) {
    return null;
  }

  return (
    <Text style={titleTextStyle} testID="action-sheet-title-text">
      {titleText}
    </Text>
  );
}

function renderAction(
  action: ActionSheetAction,
  index: number,
  styles: ReturnType<typeof useStyles>,
  onAction?: (action: ActionSheetAction, index: number) => void,
): React.ReactNode {
  const handlePress = (): void => {
    if (action.disabled) {
      return;
    }
    onAction?.(action, index);
  };

  const textStyle = [
    styles.actionText,
    action.danger && styles.dangerActionText,
    action.disabled && styles.disabledActionText,
  ];
  const iconColor = action.disabled
    ? 'disabled'
    : action.danger
      ? 'error'
      : 'default';

  return (
    <Pressable
      disabled={action.disabled}
      key={action.key ?? index}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.action,
        pressed && styles.actionPressed,
      ]}
      testID={`action-sheet-action-${index}`}
    >
      {action.icon ? (
        <Icon
          color={iconColor}
          icon={action.icon}
          size="normal"
          testID={`action-sheet-action-icon-${index}`}
        />
      ) : null}
      <Column style={styles.actionContent}>
        <Text style={textStyle}>{action.text}</Text>
        {action.description ? (
          <Text style={styles.actionDescription}>{action.description}</Text>
        ) : null}
      </Column>
    </Pressable>
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
  animation,
}: ActionSheetProps) {
  const tokenStyles = useStyles();
  const [resolvedOpen, setResolvedOpen] = useControllableValue(
    defaultOpen === true,
    open,
    undefined,
  );
  const isOpen = resolvedOpen === true;
  const shouldRenderCancelSection =
    cancel !== null && (cancel !== undefined || cancelText !== undefined);
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

  const handleActionPress = (
    action: ActionSheetAction,
    index: number,
  ): void => {
    onAction?.(action, index);
    closeInternal('action');
  };

  return (
    <Popup
      animation={animation}
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
        body: [tokenStyles.popupBody, slotStyles?.body],
      }}
    >
      <Column style={[tokenStyles.panel, style]} testID="action-sheet-panel">
        {titleNode || actions.length > 0 ? (
          <Column style={tokenStyles.group} testID="action-sheet-group">
            {titleNode ? (
              <Column
                style={tokenStyles.titleContainer}
                testID="action-sheet-title-container"
              >
                {titleNode}
              </Column>
            ) : null}
            <Column testID="action-sheet-actions-container">
              {actions.map((action, index) => (
                <React.Fragment key={action.key ?? index}>
                  {index > 0 ? (
                    <Column style={tokenStyles.actionSeparator} />
                  ) : null}
                  {renderAction(action, index, tokenStyles, handleActionPress)}
                </React.Fragment>
              ))}
            </Column>
          </Column>
        ) : null}
        {shouldRenderCancelSection ? (
          <Column
            style={tokenStyles.cancelButtonContainer}
            testID="action-sheet-cancel-container"
          >
            <Pressable
              onPress={handleCancelPress}
              style={({ pressed }) => [
                tokenStyles.cancelButton,
                pressed && tokenStyles.cancelButtonPressed,
              ]}
              testID="action-sheet-cancel-button"
            >
              {cancel !== undefined ? (
                cancel
              ) : (
                <Text
                  style={[
                    tokenStyles.cancelButtonText,
                    slotStyles?.cancelButtonText,
                  ]}
                  testID="action-sheet-cancel-text"
                >
                  {cancelText}
                </Text>
              )}
            </Pressable>
          </Column>
        ) : null}
      </Column>
    </Popup>
  );
}
