import React, { useEffect, useState } from 'react';
import { Column, Dialog, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const DEFAULT_OK_TEXT = '删除';

export interface ManageConfirmDialogProps {
  open: boolean;
  titleText: string;
  messageText: string;
  warningText?: string;
  okText?: string;
  okDisabled?: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return '操作失败，请稍后重试';
}

const useStyles = createUseSheetStyle(token => ({
  body: {
    gap: token.marginSM,
  },
  warning: {
    backgroundColor: token.colorWarningBg,
    borderRadius: token.borderRadiusSM,
    paddingHorizontal: token.paddingSM,
    paddingVertical: token.paddingXS,
  },
  error: {
    backgroundColor: token.colorErrorBg,
    borderRadius: token.borderRadiusSM,
    paddingHorizontal: token.paddingSM,
    paddingVertical: token.paddingXS,
  },
}));

export function ManageConfirmDialog({
  open,
  titleText,
  messageText,
  warningText,
  okText = DEFAULT_OK_TEXT,
  okDisabled = false,
  onCancel,
  onConfirm,
}: ManageConfirmDialogProps) {
  const styles = useStyles();
  const [errorText, setErrorText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setErrorText('');
      setIsSubmitting(false);
    }
  }, [open]);

  const handleOk = async (): Promise<boolean> => {
    setErrorText('');
    setIsSubmitting(true);
    try {
      await onConfirm();
      return true;
    } catch (error: unknown) {
      setErrorText(getErrorMessage(error));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      cancelText="取消"
      okDanger
      okDisabled={okDisabled || isSubmitting}
      okText={okText}
      onCancel={onCancel}
      onOk={handleOk}
      open={open}
      titleText={titleText}
    >
      <Column style={styles.body}>
        <Text color="secondary" size="xs">
          {messageText}
        </Text>
        {warningText ? (
          <Column style={styles.warning}>
            <Text color="warningText" size="xs">
              {warningText}
            </Text>
          </Column>
        ) : null}
        {errorText ? (
          <Column style={styles.error}>
            <Text color="errorText" size="xs">
              {errorText}
            </Text>
          </Column>
        ) : null}
      </Column>
    </Dialog>
  );
}
