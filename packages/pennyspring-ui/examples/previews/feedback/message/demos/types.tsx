import React from 'react';
import { Button, Column, Text, useMessage } from '@pennyspring/ui';

const TYPES = [
  {
    status: 'default',
    label: 'default · 白卡 + 发丝线',
    text: '云端只保留最近 12 个月，更早的记录在本机',
  },
  {
    status: 'success',
    label: 'success · 浅绿底',
    text: '已删除 餐饮 · 外卖 ¥128.00',
  },
  {
    status: 'warning',
    label: 'warning · 浅黄底',
    text: '正在使用移动网络，本次上传约 2.4 MB',
  },
  { status: 'error', label: 'error · 浅红底', text: '同步失败：网络不可用' },
  { status: 'info', label: 'info · 浅蓝底', text: '9 月预算报告已生成' },
] as const;

export function MessageTypesDemo() {
  const message = useMessage();

  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        底只取语义 Bg，正文恒为 colorText，只有图标与操作取语义色
      </Text>
      <Column gap="small">
        {TYPES.map(({ label, text, status }) => (
          <Button
            key={status}
            onPress={() => message.show({ messageText: text, status })}
          >
            {label}
          </Button>
        ))}
      </Column>
    </Column>
  );
}

export default MessageTypesDemo;
