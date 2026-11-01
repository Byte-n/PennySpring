import React from 'react';
import { Button, Column, Text, useNotification } from '@pennyspring/ui';

export function NotificationStructureDemo() {
  const notification = useNotification();

  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        操作最多两个且横排在说明下方；有操作或不给关闭时常驻，否则 3200ms
        自动收起
      </Text>
      <Column gap="small">
        <Button
          onPress={() =>
            notification.show({
              descriptionText: '结余 ¥612.40，比 8 月少花 8%。',
              titleText: '9 月预算报告已生成',
              status: 'info',
            })
          }
        >
          仅标题 + 说明
        </Button>
        <Button
          onPress={() =>
            notification.show({
              actions: [
                { onPress: () => notification.clear(), text: '查看明细' },
                { onPress: () => notification.clear(), text: '忽略' },
              ],
              descriptionText: '未连接 iCloud，请检查账号。',
              titleText: '备份失败',
              status: 'error',
            })
          }
        >
          两个操作 · 常驻
        </Button>
        <Button
          onPress={() =>
            notification.show({
              actions: [
                { onPress: () => notification.clear(), text: '去调整' },
              ],
              closable: false,
              descriptionText: '还剩 4 天，按当前节奏预计超出 ¥520。',
              titleText: '本月预算已超支 ¥379.85',
              status: 'warning',
            })
          }
        >
          无关闭 + 一个操作
        </Button>
        <Button
          onPress={() =>
            notification.show({
              descriptionText: '本地 1,284 笔记录已写入云端。',
              icon: null,
              titleText: '备份已完成',
            })
          }
        >
          无图标底板
        </Button>
      </Column>
    </Column>
  );
}

export default NotificationStructureDemo;
