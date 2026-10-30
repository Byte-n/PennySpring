import React from 'react';
import { Column, Row, Switch, Text } from '@pennyspring/ui';

export function SwitchStatesDemo() {
  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        关态轨道 colorFillSecondary，开态整条 colorPrimary；滑块恒为白并带双层轻投影
      </Text>
      <Row align="center" gap="large">
        <Switch />
        <Switch defaultValue />
      </Row>
      <Text color="tertiary" size="sm">
        按压：轨道不换色、不缩放，只有滑块放大 8%（实机按住查看）
      </Text>
      <Text color="tertiary" size="sm">
        禁用（关 / 开）：轨道 2% / 4%，滑块 colorFillTertiary / 三级灰，去投影；文字三级
      </Text>
      <Row align="center" gap="large">
        <Switch disabled />
        <Switch defaultValue disabled />
      </Row>
      <Text color="tertiary" size="sm">
        只读：保留轨道色，滑块加 1px 发丝环并去投影，不响应按压
      </Text>
      <Switch defaultValue readonly />
      <Text color="tertiary" size="sm">
        轨道外文案：开关右侧 8，字号 12；开态 colorTextSecondary，关态 colorTextTertiary
      </Text>
      <Row align="center" gap="large">
        <Switch
          checkedText="已开启提醒"
          defaultValue
          uncheckedText="未开启提醒"
        />
        <Switch checkedText="已开启提醒" uncheckedText="未开启提醒" />
      </Row>
    </Column>
  );
}

export default SwitchStatesDemo;
