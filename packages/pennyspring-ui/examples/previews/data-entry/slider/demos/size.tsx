import React from 'react';
import { Column, Slider, Text } from '@pennyspring/ui';
import type { ComponentSize } from '@pennyspring/ui';

const SIZE_SAMPLES: { size: ComponentSize; hint: string; value: number }[] = [
  { size: 'small', hint: 'small · 轨道 4 / thumb 16 / 控件高 37.4', value: 32 },
  { size: 'normal', hint: 'normal · 轨道 6 / thumb 20 / 控件高 44', value: 58 },
  { size: 'large', hint: 'large · 轨道 8 / thumb 24 / 控件高 50.6', value: 76 },
];

export function SliderSizeDemo() {
  return (
    <Column gap="normal">
      {SIZE_SAMPLES.map(({ size, hint, value }) => (
        <Column key={size} gap="small">
          <Text color="tertiary" size="sm">
            {hint}
          </Text>
          <Slider defaultValue={value} size={size} />
        </Column>
      ))}
      <Text color="tertiary" size="sm">
        端点左右各留 thumb 半径，0% 与 100% 的滑块不会被裁切
      </Text>
    </Column>
  );
}

export default SliderSizeDemo;
