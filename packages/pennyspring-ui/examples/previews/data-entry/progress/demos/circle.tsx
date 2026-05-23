import React from 'react';
import { Space, Progress } from '@pennyspring/ui';

export const progressCircleDemoTitle = 'Circle';

export function ProgressCircleDemo() {
  return (
    <>
      <Space align="center" size="large" wrap>
        <Progress.Circle percent={30} size="small" />
        <Progress.Circle percent={65} />
        <Progress.Circle percent={88} size="large" />
        <Progress.Circle percent={100} status="success" />
        <Progress.Circle
          percent={42}
          status="exception"
          format={percent => `${Math.round(percent / 10)}/10`}
        />
      </Space>
    </>
  );
}

export default ProgressCircleDemo;
