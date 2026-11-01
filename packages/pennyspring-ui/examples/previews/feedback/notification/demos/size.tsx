import React from 'react';
import { Button, Column, Text, useNotification } from '@pennyspring/ui';

const SIZES = [
  { label: 'small · 26 底板 / 内边距 12', size: 'small' },
  { label: 'normal · 32 底板 / 内边距 16', size: 'normal' },
  { label: 'large · 38 底板 / 内边距 16', size: 'large' },
] as const;

export function NotificationSizeDemo() {
  const notification = useNotification();

  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        底板 26 / 32 / 38，标题 12 / 14 / 16；large 用于两行说明 + 操作
      </Text>
      <Column gap="small">
        {SIZES.map(({ label, size }) => (
          <Button
            key={size}
            onPress={() =>
              notification.show({
                descriptionText: '96 笔已匹配分类，32 笔待分类。',
                size,
                titleText: '已导入 128 笔记录',
                status: 'success',
              })
            }
          >
            {label}
          </Button>
        ))}
      </Column>
    </Column>
  );
}

export default NotificationSizeDemo;
