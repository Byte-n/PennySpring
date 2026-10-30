import React from 'react';
import { Button, Column, Result, Text } from '@pennyspring/ui';
import type { ComponentSize } from '@pennyspring/ui';

const SIZE_SAMPLES: { size: ComponentSize; hint: string }[] = [
  { size: 'small', hint: 'small · 图标 40 · 标题 16 · 上下 12' },
  { size: 'normal', hint: 'normal · 图标 48 · 标题 18 · 上下 16' },
  { size: 'large', hint: 'large · 图标 56 · 标题 22 · 上下 24' },
];

export function ResultSizeDemo() {
  return (
    <Column gap="normal">
      {SIZE_SAMPLES.map(({ size, hint }) => (
        <Column key={size} gap="small">
          <Text color="tertiary" size="xs">{hint}</Text>
          <Result
            size={size}
            status="success"
            subtitleText="¥ 128.00 · 餐饮 · 日常开销"
            titleText="记账成功"
            extra={
              <Button size={size === 'small' ? 'small' : 'normal'} variant="solid">
                完成
              </Button>
            }
          />
        </Column>
      ))}
      <Text color="tertiary" size="xs">
        图标本体 20 / 24 / 28，语义浅底；说明最大宽 320，居中换行
      </Text>
    </Column>
  );
}

export default ResultSizeDemo;
