import React from 'react';
import { Column, Row, Slider, Text } from '@pennyspring/ui';

export function SliderAnnotationsDemo() {
  const [budget, setBudget] = React.useState(3200);
  const [volume, setVolume] = React.useState(35);

  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        金额：值 20/600 等宽，上限与说明 12/三级；拖动值由业务层节流展示
      </Text>
      <Column gap="small">
        <Text size="xl" weight="strong">
          ¥{budget.toLocaleString('zh-CN')}
        </Text>
        <Slider max={5000} onChange={setBudget} step={100} value={budget} />
        <Row justify="between">
          <Text color="tertiary" size="xs">¥0</Text>
          <Text color="tertiary" size="xs">预算上限 ¥5,000</Text>
        </Row>
      </Column>
      <Text color="tertiary" size="sm">
        百分比：同一屏只用一条，两条需要分组并各带标题
      </Text>
      <Column gap="small">
        <Slider defaultValue={volume} onChange={setVolume} value={volume} />
        <Row justify="between">
          <Text color="tertiary" size="xs">音量 {volume}%</Text>
          <Text color="tertiary" size="xs">100%</Text>
        </Row>
      </Column>
    </Column>
  );
}

export default SliderAnnotationsDemo;
