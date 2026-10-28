import React from 'react';
import { Column, Steps, Text } from '@pennyspring/ui';
import type { StepsItem } from '@pennyspring/ui';

const STEP_ITEMS: StepsItem[] = [
  {
    key: 'create',
    titleText: '创建账本',
    descriptionText: '已完成，不响应点击',
  },
  {
    key: 'invite',
    titleText: '邀请成员',
    descriptionText: '需要管理员权限',
  },
  {
    key: 'done',
    titleText: '开始记账',
    descriptionText: '待开始',
  },
];

export const stepsReadonlyAndDisabledDemoTitle = '只读 / 禁用';

export function StepsReadonlyAndDisabledDemo() {
  return (
    <Column gap="large">
      <Column gap="small">
        <Text color="tertiary" size="xs">只读：保留状态色与对比，仅去掉按压</Text>
        <Steps defaultValue={0} items={STEP_ITEMS} readonly />
      </Column>
      <Column gap="small">
        <Text color="tertiary" size="xs">禁用：整体透明度 .45，不响应按压</Text>
        <Steps defaultValue={1} items={STEP_ITEMS} disabled />
      </Column>
      <Column gap="small">
        <Text color="tertiary" size="xs">单项禁用：仅该步降透明度，其余步仍可点</Text>
        <Steps
          defaultValue={0}
          items={[STEP_ITEMS[0], { ...STEP_ITEMS[1], disabled: true }, STEP_ITEMS[2]]}
        />
      </Column>
    </Column>
  );
}

export default StepsReadonlyAndDisabledDemo;
