import React from 'react';
import { Button, Column, Text, useNotification } from '@pennyspring/ui';

export function NotificationPlacementDemo() {
  const notification = useNotification();

  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        四角收敛为 top / bottom，左右统一 16；top 距状态栏 8，bottom 距安全区 24
      </Text>
      <Column gap="small">
        <Button
          onPress={() =>
            notification.show({
              descriptionText: '96 笔已匹配分类。',
              placement: 'top',
              titleText: '已导入 128 笔记录',
              status: 'success',
            })}
        >
          top · 状态栏 + 8
        </Button>
        <Button
          onPress={() =>
            notification.show({
              descriptionText: '未连接 iCloud。',
              placement: 'bottom',
              titleText: '备份失败',
              status: 'error',
            })}
        >
          bottom · 24 + 安全区
        </Button>
        <Button onPress={() => notification.clear()}>清除</Button>
      </Column>
    </Column>
  );
}

export default NotificationPlacementDemo;
