import React from 'react';
import { Column, Row, Switch, Text } from '@pennyspring/ui';

export function SwitchRowDemo() {
  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        checkedText / uncheckedText 同时提供时显示在开关右侧；文案不参与轨道宽度，轨道始终为滑块 × 2
      </Text>
      <Column gap="small">
        <Row align="center" gap="normal">
          <Switch checkedText="已同步" defaultValue uncheckedText="未同步" />
        </Row>
        <Row align="center" gap="normal">
          <Switch checkedText="已同步" uncheckedText="未同步" />
        </Row>
      </Column>
      <Text color="tertiary" size="sm">
        整行组合：标签 14、副文案 12/三级，开关垂直居中；标签由外部布局承担，不是 Switch 的插槽
      </Text>
      <Row align="center" gap="normal" justify="between">
        <Column gap="small">
          <Text size="sm">在总览中隐藏</Text>
          <Text color="tertiary" size="xs">隐藏后不计入净资产</Text>
        </Column>
        <Switch />
      </Row>
      <Row align="center" gap="normal" justify="between">
        <Column gap="small">
          <Text size="sm">开启生物识别</Text>
          <Text color="tertiary" size="xs">进入应用时验证一次身份</Text>
        </Column>
        <Switch defaultValue size="large" />
      </Row>
    </Column>
  );
}

export default SwitchRowDemo;
