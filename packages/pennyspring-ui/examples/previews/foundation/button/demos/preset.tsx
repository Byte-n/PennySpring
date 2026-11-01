import React from 'react';
import { Button, Column, Space, Text } from '@pennyspring/ui';

const PRESET_COLORS = [
  'red',
  'volcano',
  'orange',
  'gold',
  'yellow',
  'lime',
  'green',
  'cyan',
  'blue',
  'geekblue',
  'purple',
  'magenta',
  'pink',
] as const;

export function ButtonPresetDemo() {
  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        预设色走 colorX6 / colorX1 /
        colorX3；财务界面除收支与转账外不应出现彩色按钮
      </Text>
      <Space align="center" gap="normal" wrap>
        {PRESET_COLORS.map(color => (
          <Button key={color} color={color} variant="filled">
            {color}
          </Button>
        ))}
      </Space>
    </Column>
  );
}

export default ButtonPresetDemo;
