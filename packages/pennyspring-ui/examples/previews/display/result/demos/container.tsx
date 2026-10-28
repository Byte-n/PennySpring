import React from 'react';
import { Button, Card, Column, Result, Text } from '@pennyspring/ui';

export const resultContainerDemoTitle = '承载场景';

export function ResultContainerDemo() {
  return (
    <Column gap="large">
      <Column gap="small">
        <Text color="tertiary" size="xs">页内结果：页面上下留 32，不再套第二层卡片</Text>
        <Result
          status="error"
          subtitleText="文件超过 20MB，请缩小时间范围后重试"
          titleText="导出失败"
          extra={
            <Button size="small" variant="solid">重新导出</Button>
          }
        />
      </Column>
      <Column gap="small">
        <Text color="tertiary" size="xs">卡片内结果：Card 给内边距，Result 用 small 档</Text>
        <Card>
          <Result
            size="small"
            status="info"
            subtitleText="邀请家人加入后可一起记账"
            titleText="还没有共享账本"
            extra={
              <Button size="small" variant="outlined">创建账本</Button>
            }
          />
        </Card>
      </Column>
      <Column gap="small">
        <Text color="tertiary" size="xs">icon=null：去掉图标后标题不再保留图标占位</Text>
        <Result
          size="small"
          status="info"
          subtitleText="换一个分类或时间范围试试"
          titleText="还没有筛选结果"
          extra={
            <Button size="small" variant="outlined">清除筛选</Button>
          }
          icon={null}
        />
      </Column>
    </Column>
  );
}

export default ResultContainerDemo;
