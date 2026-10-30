import React from 'react';
import { Button, Column, Text, useMessage } from '@pennyspring/ui';

export function MessagePlacementDemo() {
  const message = useMessage();

  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        top 为默认档，距状态栏 8；bottom 距安全区 24，用于底部动作区上方
      </Text>
      <Column gap="small">
        <Button
          onPress={() =>
            message.show({
              action: { text: '撤销', onPress: () => message.hide(0) },
              messageText: '已保存这笔记录',
              placement: 'top',
              status: 'success',
            })}
        >
          top · 状态栏 + 8
        </Button>
        <Button
          onPress={() =>
            message.show({
              action: { text: '重试', onPress: () => message.hide(0) },
              messageText: '同步失败：网络不可用',
              placement: 'bottom',
              status: 'error',
            })}
        >
          bottom · 24 + 安全区
        </Button>
        <Button onPress={() => message.clear()}>清除</Button>
      </Column>
    </Column>
  );
}

export default MessagePlacementDemo;
