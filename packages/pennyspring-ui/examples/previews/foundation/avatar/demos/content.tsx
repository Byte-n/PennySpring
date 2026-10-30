import React from 'react';
import { Avatar, Column, Icon, Row, Text } from '@pennyspring/ui';

export function AvatarContentDemo() {
  return (
    <Column gap="normal">
      <Row gap="small">
        <Avatar
          src={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }}
          text="图"
        />
        <Avatar text="林" />
        <Avatar icon={<Icon icon="user" size="normal" color="secondary" />} />
        <Avatar />
      </Row>
      <Text color="tertiary" size="xs">
        优先级：图片 → 首字 → 图标 → 占位；首字只取 trim 后第一个字符，图片加载失败自动降级到首字
      </Text>
      <Row gap="small">
        <Avatar size="small" text="评" />
        <Avatar size="normal" text="陈" />
        <Avatar size="large" text="周" />
      </Row>
      <Text color="tertiary" size="xs">
        首字颜色 colorTextSecondary，字重 600；空态图标 colorTextQuaternary
      </Text>
    </Column>
  );
}

export default AvatarContentDemo;
