import React from 'react';
import { Button, Column, Text, useToast } from '@pennyspring/ui';

export function ToastSizeDemo() {
  const toast = useToast();

  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        small 34 / normal 40 / large 46；正文 12 / 14 / 16，单行最多 24 字
      </Text>
      <Column gap="small">
        <Button
          size="small"
          onPress={() =>
            toast.show({ messageText: '已复制 ¥128.00', size: 'small' })
          }
        >
          small · 密集操作反馈
        </Button>
        <Button
          size="small"
          onPress={() => toast.show({ messageText: '已保存这笔记录' })}
        >
          normal · 默认档
        </Button>
        <Button
          size="small"
          onPress={() =>
            toast.show({ messageText: '已导入 128 笔记录', size: 'large' })
          }
        >
          large · 字数多或需要看清金额
        </Button>
      </Column>
    </Column>
  );
}

export default ToastSizeDemo;
