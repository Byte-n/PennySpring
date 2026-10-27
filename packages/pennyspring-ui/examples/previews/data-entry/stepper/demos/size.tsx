import React from 'react';
import { Column, Row, Stepper, Text } from '@pennyspring/ui';
import type { ComponentSize } from '@pennyspring/ui';

export const stepperSizeDemoTitle = '尺寸（size）';

const SIZE_SAMPLES: { size: ComponentSize; hint: string; value: number }[] = [
  { size: 'small', hint: 'small · 胶囊 37.4 / 按钮 24 / 图标 12', value: 2 },
  { size: 'normal', hint: 'normal · 胶囊 44 / 按钮 32 / 图标 16', value: 6 },
  { size: 'large', hint: 'large · 胶囊 50.6 / 按钮 36 / 图标 18', value: 12 },
];

export function StepperSizeDemo() {
  return (
    <Column gap="normal">
      {SIZE_SAMPLES.map(({ size, hint, value }) => (
        <Column key={size} gap="small">
          <Text color="tertiary" size="sm">{hint}</Text>
          <Row>
            <Stepper defaultValue={value} max={99} min={0} size={size} />
          </Row>
        </Column>
      ))}
      <Text color="tertiary" size="sm">
        胶囊高度取 controlHeightSM / controlHeight / controlHeightLG；999 胶囊，无描边无分隔线
      </Text>
    </Column>
  );
}

export default StepperSizeDemo;
