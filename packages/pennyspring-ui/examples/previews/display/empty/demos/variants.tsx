import React from 'react';
import { Button, Column, Empty, Text } from '@pennyspring/ui';

export function EmptyVariantsDemo() {
  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        inline 用于整页空态，boxed 用于卡片内空态，compact 只表达“没有更多”
      </Text>
      <Empty
        titleText="十月还没有记录"
        descriptionText="点右下角记一笔，或从旧账单导入历史数据。"
        action={<Button size="small">＋ 记一笔</Button>}
      />
      <Empty
        variant="boxed"
        titleText="「餐饮」没有记录"
        descriptionText="换个分类或时间范围试试。"
        action={
          <Button size="small" type="text">
            清除筛选
          </Button>
        }
      />
      <Column gap="small">
        <Empty compact descriptionText="当天没有更多记录" />
        <Empty compact descriptionText="已加载全部 47 笔" />
      </Column>
    </Column>
  );
}

export default EmptyVariantsDemo;
