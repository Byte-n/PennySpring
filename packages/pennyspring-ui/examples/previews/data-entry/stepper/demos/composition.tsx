import React from 'react';
import { Column, Row, Stepper, Text } from '@pennyspring/ui';

export function StepperCompositionDemo() {
  const [terms, setTerms] = React.useState(4);
  const [count, setCount] = React.useState(3);

  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        单位：12/三级，紧跟数值；数值最小宽 40，3 位不跳宽
      </Text>
      <Row gap="large">
        <Stepper defaultValue={3} max={12} min={1} unitText="期" />
        <Stepper defaultValue={128} max={999} min={0} />
      </Row>
      <Text color="tertiary" size="sm">
        整行：行高 44，标签 14、副文案 12，Stepper 右对齐
      </Text>
      <Row align="center" justify="between" gap="normal">
        <Column gap="small">
          <Text size="sm">分期数</Text>
          <Text color="tertiary" size="xs">每期 ¥1,080.00</Text>
        </Column>
        <Stepper
          max={12}
          min={1}
          onChange={setTerms}
          unitText="期"
          value={terms}
        />
      </Row>
      <Row align="center" justify="between" gap="normal">
        <Column gap="small">
          <Text size="sm">记账提醒</Text>
          <Text color="tertiary" size="xs">每天 20:00</Text>
        </Column>
        <Stepper max={3} min={0} onChange={setCount} value={count} />
      </Row>
    </Column>
  );
}

export default StepperCompositionDemo;
