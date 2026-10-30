import React from 'react';
import { Button, Column, Text, useToast } from '@pennyspring/ui';

export function ToastPlacementDemo() {
  const toast = useToast();

  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        bottom 为默认档；top 在有 Message 的页面不要用；center 只用于全屏阅读且没有底部动作的场景
      </Text>
      <Column gap="small">
        <Button
          onPress={() => toast.show({ messageText: '已保存', placement: 'top' })}
        >
          top · 24 + 安全区
        </Button>
        <Button
          onPress={() => toast.show({ messageText: '已复制', placement: 'center' })}
        >
          center · 视觉中线
        </Button>
        <Button
          onPress={() => toast.show({ messageText: '已保存这笔记录', placement: 'bottom' })}
        >
          bottom · 24 + 安全区
        </Button>
      </Column>
    </Column>
  );
}

export default ToastPlacementDemo;
