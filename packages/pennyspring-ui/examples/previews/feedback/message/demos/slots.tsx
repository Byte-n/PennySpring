import React from 'react';
import { Button, Column, Text, useMessage } from '@pennyspring/ui';

export function MessageSlotsDemo() {
  const message = useMessage();

  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        操作最多一个且紧随正文；有操作时常驻，直到点操作或关闭；closable=false 时必须给操作
      </Text>
      <Column gap="small">
        <Button
          onPress={() =>
            message.show({
              messageText: '已切换到「十月账单」账本',
              status: 'info',
              closable: false,
            })}
        >
          纯文本 · 无操作无关闭
        </Button>
        <Button
          onPress={() =>
            message.show({
              action: { text: '撤销', onPress: () => message.hide(0) },
              messageText: '已保存这笔记录',
              status: 'success',
            })}
        >
          文本 + 撤销
        </Button>
        <Button
          onPress={() =>
            message.show({
              action: { text: '重试', onPress: () => message.hide(0) },
              messageText: '同步失败：网络不可用',
              status: 'error',
            })}
        >
          文本 + 重试
        </Button>
        <Button
          onPress={() =>
            message.show({
              messageText: '3 笔记录时间缺失，已按创建时间归档。可到「账单明细」逐笔修正，或批量重新导入。',
              status: 'warning',
            })}
        >
          两行截断
        </Button>
        <Button
          onPress={() =>
            message.show({
              icon: null,
              messageText: '列表已按金额重新排序',
              status: 'info',
            })}
        >
          无图标（不推荐）
        </Button>
      </Column>
    </Column>
  );
}

export default MessageSlotsDemo;
