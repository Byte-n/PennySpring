import React from 'react';
import { Column, Row, Stepper, Text } from '@pennyspring/ui';

export function StepperStatesDemo() {
  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        默认：胶囊 colorFillTertiary，数值主文字；按压只作用于按钮，999 圆形 colorFillSecondary
      </Text>
      <Row>
        <Stepper defaultValue={6} max={99} min={0} />
      </Row>
      <Text color="tertiary" size="sm">
        到边界：只有减号/加号降四级，胶囊与数值不变，且不再触发 onChange
      </Text>
      <Row gap="large">
        <Stepper defaultValue={0} max={99} min={0} />
        <Stepper defaultValue={12} max={12} min={0} />
      </Row>
      <Text color="tertiary" size="sm">
        禁用：胶囊 colorFillQuaternary，数值与按钮四级；只读：保留胶囊底，数值二级、按钮四级
      </Text>
      <Row gap="large">
        <Stepper defaultValue={6} disabled max={99} min={0} />
        <Stepper defaultValue={6} max={99} min={0} readonly />
      </Row>
    </Column>
  );
}

export default StepperStatesDemo;
