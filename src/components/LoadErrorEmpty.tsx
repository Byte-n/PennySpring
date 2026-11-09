import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Button, Empty } from '@pennyspring/ui';

interface LoadErrorEmptyProps {
  titleText?: string;
  descriptionText?: string;
  onRetry: () => void;
  style?: StyleProp<ViewStyle>;
}

/** 数据加载失败时的统一空态，提供重试入口。 */
export function LoadErrorEmpty({
  titleText = '数据加载失败',
  descriptionText = '请检查网络或稍后重试。',
  onRetry,
  style,
}: LoadErrorEmptyProps) {
  return (
    <Empty
      titleText={titleText}
      descriptionText={descriptionText}
      action={
        <Button onPress={onRetry} size="small" type="text">
          重试
        </Button>
      }
      style={style}
    />
  );
}
