import React from 'react';
import { Button, Row, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';

interface ResourceLoadErrorProps {
  error: boolean;
  messageText?: string;
  onRetry: () => void;
}

const useStyles = createUseSheetStyle(token => ({
  notice: {
    backgroundColor: token.colorErrorBg,
    borderRadius: token.borderRadiusSM,
    marginBottom: token.marginSM,
    paddingHorizontal: token.paddingSM,
    paddingVertical: token.paddingXS,
  },
}));

/** 记账表单的资源依赖加载失败提示，避免把失败误展示为空选项。 */
export function ResourceLoadError({
  error,
  messageText = '资产或标签加载失败',
  onRetry,
}: ResourceLoadErrorProps) {
  const styles = useStyles();

  if (!error) {
    return null;
  }

  return (
    <Row align="center" justify="between" style={styles.notice}>
      <Text color="errorText" size="xs">
        {messageText}
      </Text>
      <Button onPress={onRetry} size="small" type="text">
        重试
      </Button>
    </Row>
  );
}
