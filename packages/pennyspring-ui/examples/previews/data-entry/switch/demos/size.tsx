import React from 'react';
import { Column, Row, Switch, Text } from '@pennyspring/ui';
import type { ComponentSize } from '@pennyspring/ui';

const SIZE_SAMPLES: { size: ComponentSize; hint: string; label: string }[] = [
  {
    size: 'small',
    hint: 'small · 轨道 28×8 / 滑块 14 / 控件高 37.4',
    label: '紧凑开关',
  },
  {
    size: 'normal',
    hint: 'normal · 轨道 40×10 / 滑块 20 / 控件高 44',
    label: '在总览中隐藏',
  },
  {
    size: 'large',
    hint: 'large · 轨道 52×12 / 滑块 26 / 控件高 50.6',
    label: '开启生物识别',
  },
];

export function SwitchSizeDemo() {
  return (
    <Column gap="normal">
      {SIZE_SAMPLES.map(({ size, hint, label }) => (
        <Column key={size} gap="small">
          <Text color="tertiary" size="sm">
            {hint}
          </Text>
          <Row align="center" gap="large">
            <Row align="center" gap="small">
              <Text size="sm">{label}</Text>
              <Switch size={size} />
            </Row>
            <Row align="center" gap="small">
              <Text size="sm">{label}</Text>
              <Switch defaultValue size={size} />
            </Row>
          </Row>
        </Column>
      ))}
      <Text color="tertiary" size="sm">
        轨道宽 = 滑块 × 2，位移 = 滑块直径；控件高度取 controlHeightSM /
        controlHeight / controlHeightLG
      </Text>
    </Column>
  );
}

export default SwitchSizeDemo;
