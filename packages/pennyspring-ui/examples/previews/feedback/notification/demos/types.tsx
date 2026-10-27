import React from 'react';
import { Button, Column, Text, useNotification } from '@pennyspring/ui';

export const notificationTypesDemoTitle = '类型（type）';

const TYPES = [
  { type: 'default', label: 'default · 中性底板', title: '备份已完成', description: '本地 1,284 笔记录已写入云端。' },
  { type: 'success', label: 'success · 浅绿底板', title: '已导入 128 笔记录', description: '96 笔已匹配分类，32 笔待分类。' },
  { type: 'warning', label: 'warning · 浅黄底板', title: '本月预算已超支 ¥379.85', description: '还剩 4 天，按当前节奏预计超出 ¥520。' },
  { type: 'error', label: 'error · 浅红底板', title: '备份失败', description: '未连接 iCloud，请检查账号。' },
  { type: 'info', label: 'info · 浅蓝底板', title: '9 月预算报告已生成', description: '结余 ¥612.40，比 8 月少花 8%。' },
] as const;

export function NotificationTypesDemo() {
  const notification = useNotification();

  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        卡片恒为白底 + 阴影，语义色只出现在图标底板、图标与操作文字
      </Text>
      <Column gap="small">
        {TYPES.map(({ description, label, title, type }) => (
          <Button
            key={type}
            onPress={() =>
              notification.show({ descriptionText: description, titleText: title, type })}
          >
            {label}
          </Button>
        ))}
      </Column>
    </Column>
  );
}

export default NotificationTypesDemo;
