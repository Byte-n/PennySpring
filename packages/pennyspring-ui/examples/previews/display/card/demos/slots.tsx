import React from 'react';
import { Card, Column, Row, Text } from '@pennyspring/ui';

export function CardSlotsDemo() {
  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        title &gt; titleText；extra 只放“管理 / 更多 / 计数”，footer
        放次级信息或整块入口
      </Text>
      <Card titleText="餐饮">
        <Row align="center" justify="between">
          <Text color="secondary" size="sm">
            本月
          </Text>
          <Text weight="medium" size="sm">
            ¥1,286.50
          </Text>
        </Row>
      </Card>
      <Card titleText="餐饮" extra="按分类 ›">
        <Row align="center" justify="between">
          <Text color="secondary" size="sm">
            外卖
          </Text>
          <Text weight="medium" size="sm">
            ¥986.50
          </Text>
        </Row>
      </Card>
      <Card
        titleText="交通"
        footer={
          <Row justify="between">
            <Text color="secondary" size="sm">
              共 11 笔
            </Text>
            <Text color="secondary" size="sm">
              查看明细 ›
            </Text>
          </Row>
        }
      >
        <Row align="center" justify="between">
          <Text color="secondary" size="sm">
            地铁
          </Text>
          <Text weight="medium" size="sm">
            ¥693.35
          </Text>
        </Row>
      </Card>
      <Card
        title={
          <Text size="md" weight="semibold">
            自定义标题节点
          </Text>
        }
        extra={
          <Text color="primary" size="sm">
            去设置
          </Text>
        }
      >
        <Text color="secondary" size="sm">
          title 传 ReactNode 时完全接管标题区，titleText 与默认字号都不再生效
        </Text>
      </Card>
    </Column>
  );
}

export default CardSlotsDemo;
