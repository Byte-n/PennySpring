import React from 'react';
import { Column, Steps, Text } from '@pennyspring/ui';
import type { ComponentSize, StepsItem } from '@pennyspring/ui';

const STEP_ITEMS: StepsItem[] = [
  {
    key: 'book',
    titleText: '选择账本',
    descriptionText: '已选择「日常开销」',
  },
  {
    key: 'amount',
    titleText: '填写金额',
    descriptionText: '当前步骤',
  },
  {
    key: 'confirm',
    titleText: '确认提交',
    descriptionText: '待开始',
  },
];

const SIZE_SAMPLES: { size: ComponentSize; hint: string }[] = [
  { size: 'small', hint: 'small · 指示器 20 · 标题 14' },
  { size: 'normal', hint: 'normal · 指示器 24 · 标题 16' },
  { size: 'large', hint: 'large · 指示器 28 · 标题 18' },
];

export function StepsSizeDemo() {
  return (
    <Column gap="normal">
      {SIZE_SAMPLES.map(({ size, hint }) => (
        <Column key={size} gap="small">
          <Text color="tertiary" size="xs">{hint}</Text>
          <Steps defaultValue={1} items={STEP_ITEMS} size={size} />
        </Column>
      ))}
      <Text color="tertiary" size="xs">
        指示器 20 / 24 / 28；连接线 2px，未完成 colorSplit，已完成 colorSuccess
      </Text>
    </Column>
  );
}

export default StepsSizeDemo;
