import React from 'react';
import { Card, Column, Text } from '@pennyspring/ui';

export function CardStateDemo() {
  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        整块按压 150ms 变 colorFillTertiary，不缩放；loading 保留内容压到
        45%，高度不变；禁用只降标题色，不换底
      </Text>
      <Card onPress={() => undefined} titleText="可点击卡片" extra="›">
        <Text color="secondary" size="sm">
          整块都是热区，按住查看按压底色
        </Text>
      </Card>
      <Card loading titleText="分类趋势" extra="近 7 天">
        <Text color="secondary" size="sm">
          加载中保留占位，内容压到 45%，高度与加载前一致
        </Text>
      </Card>
      <Card
        loading
        loadingPlaceholder={
          <Text color="tertiary" size="sm">
            骨架屏节点
          </Text>
        }
        titleText="自定义加载节点"
      >
        <Text color="secondary" size="sm">
          该文案会被 loadingPlaceholder 替换
        </Text>
      </Card>
      <Card
        disabled
        onPress={() => undefined}
        titleText="报销凭证"
        extra="不可用"
      >
        <Text color="secondary" size="sm">
          本月无可报销记录
        </Text>
      </Card>
    </Column>
  );
}

export default CardStateDemo;
