import React from 'react';
import { Column, Icon, Loading, Text } from '@pennyspring/ui';

export function LoadingStatesDemo() {
  return (
    <Column gap="normal">
      <Column gap="small">
        <Text color="tertiary" size="sm">
          仅转圈：text 缺省，inline 高度固定 20
        </Text>
        <Loading />
      </Column>
      <Column gap="small">
        <Text color="tertiary" size="sm">
          自定义 indicator：节点需自带 16 / 20 占位
        </Text>
        <Loading
          indicator={<Icon icon="download" size={16} color="primary" />}
          text="正在换算汇率"
        />
      </Column>
      <Column gap="small">
        <Text color="tertiary" size="sm">
          stopped 且有文案：只留文案，不留空转圈
        </Text>
        <Loading animating={false} text="已停止加载" />
      </Column>
      <Column gap="small">
        <Text color="tertiary" size="sm">
          stopped 且无文案：组件不渲染，避免占位撑高
        </Text>
        <Loading animating={false} />
      </Column>
      <Column gap="small">
        <Text color="tertiary" size="sm">
          block 副文案只写进度或耗时
        </Text>
        <Loading
          variant="block"
          text="正在导入历史账单"
          description="第 128 / 430 笔"
        />
      </Column>
    </Column>
  );
}

export default LoadingStatesDemo;
