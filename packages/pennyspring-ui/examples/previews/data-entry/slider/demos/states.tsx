import React from 'react';
import { Column, Slider, Text } from '@pennyspring/ui';

export const sliderStatesDemoTitle = '状态';

export function SliderStatesDemo() {
  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        默认：轨道 colorFillSecondary，填充与 thumb 环 colorPrimary；按压时 thumb 放大 1.1（实机按住查看）
      </Text>
      <Slider defaultValue={45} />
      <Text color="tertiary" size="sm">
        禁用：轨道 colorFillQuaternary，填充四级，thumb 换成 colorBorder 发丝环并去投影
      </Text>
      <Slider defaultValue={45} disabled />
      <Text color="tertiary" size="sm">
        只读：保留主色轨道与环，不响应拖拽
      </Text>
      <Slider defaultValue={70} readonly />
      <Text color="tertiary" size="sm">
        到头：0% 与 100% 时滑块半悬在轨道端点
      </Text>
      <Slider defaultValue={0} />
      <Slider defaultValue={100} />
    </Column>
  );
}

export default SliderStatesDemo;
