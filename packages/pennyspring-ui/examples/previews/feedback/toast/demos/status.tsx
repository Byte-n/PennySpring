import React from 'react';
import { Button, Column, Text, useToast } from '@pennyspring/ui';

export function ToastStatusDemo() {
  const toast = useToast();

  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        dot 无类型、success 写结果不写“成功”二字、error
        只用于操作未生效；需要决策时改用 Dialog
      </Text>
      <Column gap="small">
        <Button onPress={() => toast.show({ messageText: '已复制 ¥4,379.85' })}>
          dot 圆点
        </Button>
        <Button
          onPress={() =>
            toast.show({ messageText: '已保存这笔记录', status: 'success' })
          }
        >
          success 勾
        </Button>
        <Button
          onPress={() =>
            toast.show({ messageText: '删除失败，请重试', status: 'error' })
          }
        >
          error 叹号
        </Button>
        <Button
          onPress={() =>
            toast.show({
              messageText: '已把 10-01 至 10-27 的 47 笔支出汇总复制到剪贴板',
              status: 'success',
            })
          }
        >
          超长文案 · 单行截断
        </Button>
      </Column>
    </Column>
  );
}

export default ToastStatusDemo;
