import React from 'react';
import { Column, Steps, Text } from '@pennyspring/ui';
import type { StepsItem } from '@pennyspring/ui';

const INTERACTIVE_ITEMS: StepsItem[] = [
  {
    key: 'book',
    titleText: '选择账本',
    descriptionText: '日常开销 · 已确认',
  },
  {
    key: 'amount',
    titleText: '填写金额',
    descriptionText: '金额不能为 0，请修改后继续',
    status: 'error',
  },
  {
    key: 'category',
    titleText: '选择分类',
    descriptionText: '当前步骤',
  },
  {
    key: 'confirm',
    titleText: '确认提交',
    descriptionText: '待开始',
  },
];

export function StepsStatesDemo() {
  const [value, setValue] = React.useState(0);

  return (
    <Column gap="normal">
      <Text color="tertiary" size="xs">
        四态全览：wait 发丝描边 + 二级标题；process 主色 + 4px colorPrimaryBg 外环；finish 成功色 + 勾；error 错误色 + 叉
      </Text>
      <Steps items={INTERACTIVE_ITEMS} value={value} onChange={setValue} />
      <Text color="tertiary" size="xs">
        点击未完成步：该步变 process，之前的步变 finish；点击当前步不重复触发 onChange
      </Text>
      <Steps
        defaultValue={0}
        items={[
          { key: 'wait', titleText: '待开始', descriptionText: 'wait' },
          { key: 'process', titleText: '正在做', descriptionText: 'process' },
          { key: 'finish', titleText: '已完成', descriptionText: 'finish' },
        ]}
        status="wait"
      />
    </Column>
  );
}

export default StepsStatesDemo;
