import React from 'react';
import { Button, Column, Text, useToast } from '@pennyspring/ui';

export const toastReplaceDemoTitle = '单实例替换';

export function ToastReplaceDemo() {
  const toast = useToast();

  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        连续点击只会替换同一颗胶囊并重置 1800ms 计时，不会叠出第二条
      </Text>
      <Column gap="small">
        <Button onPress={() => toast.show({ messageText: '已保存这笔记录', status: 'success' })}>
          保存
        </Button>
        <Button onPress={() => toast.show({ messageText: '已复制 ¥4,379.85' })}>
          复制金额
        </Button>
        <Button
          onPress={() => toast.show({ messageText: '已把 10 月汇总复制到剪贴板', status: 'success' })}
        >
          长文案
        </Button>
        <Button onPress={() => toast.clear()}>清除</Button>
      </Column>
    </Column>
  );
}

export default ToastReplaceDemo;
