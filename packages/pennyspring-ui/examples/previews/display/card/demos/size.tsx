import React from 'react';
import { Card, Column, Row, Text } from '@pennyspring/ui';

const SIZES = [
  { value: 'small', label: 'small · 内边距 12 / 圆角 12' },
  { value: 'normal', label: 'normal · 内边距 16 / 圆角 12' },
  { value: 'large', label: 'large · 内边距 20 / 圆角 16' },
] as const;

export function CardSizeDemo() {
  return (
    <Column gap="normal">
      {SIZES.map(({ label, value }) => (
        <Column key={value} gap="small">
          <Text color="tertiary" size="sm">
            {label}
          </Text>
          <Card
            size={value}
            titleText="交通"
            extra="11 笔"
            footer={
              <Row justify="between">
                <Text color="secondary" size="sm">
                  共 ¥693.35
                </Text>
                <Text color="secondary" size="sm">
                  查看明细 ›
                </Text>
              </Row>
            }
          >
            <Text color="secondary" size="sm">
              地铁与公交合计 ¥693.35
            </Text>
          </Card>
        </Column>
      ))}
    </Column>
  );
}

export default CardSizeDemo;
