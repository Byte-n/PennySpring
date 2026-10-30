import React from 'react';
import { Column, Progress, Text } from '@pennyspring/ui';

function RecordCountInfo() {
  return <Text color="tertiary" size="xs">已记 12 / 20 笔</Text>;
}

function formatRecordCount() {
  return <RecordCountInfo />;
}

export function ProgressStatesDemo() {
  return (
    <Column gap="normal">
      <Column gap="small">
        <Text color="tertiary" size="xs">normal / success / exception：只有已完成段与百分比跟状态色</Text>
        <Progress.Bar percent={62} />
        <Progress.Bar percent={100} status="success" />
        <Progress.Bar percent={84} status="exception" />
      </Column>
      <Column gap="small">
        <Text color="tertiary" size="xs">exception 必须配文案，不能只靠红色</Text>
        <Progress.Bar
          percent={84}
          status="exception"
          format={percent => `已超支 ${Math.round(percent)}%`}
        />
      </Column>
      <Column gap="small">
        <Text color="tertiary" size="xs">format 返回节点时不套默认字号；showInfo=false 完全收起信息位</Text>
        <Progress.Bar
          percent={60}
          format={formatRecordCount}
        />
        <Progress.Bar percent={60} showInfo={false} />
      </Column>
    </Column>
  );
}

export default ProgressStatesDemo;
