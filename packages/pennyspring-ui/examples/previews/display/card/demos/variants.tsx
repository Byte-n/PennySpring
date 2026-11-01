import React from 'react';
import { Card, Column, Row, Text } from '@pennyspring/ui';

export function CardVariantsDemo() {
  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        plain 靠页面底分层，elevated 每屏最多一块，summary
        的重点是金额排印而不是颜色；三者都没有描边
      </Text>
      <Card titleText="支出构成" extra="按分类 ›">
        <Column gap="small">
          <Row align="center" justify="between">
            <Text color="secondary" size="sm">
              餐饮
            </Text>
            <Text weight="medium" size="sm">
              ¥1,286.50
            </Text>
          </Row>
          <Row align="center" justify="between">
            <Text color="secondary" size="sm">
              房租
            </Text>
            <Text weight="medium" size="sm">
              ¥2,400.00
            </Text>
          </Row>
        </Column>
      </Card>
      <Card variant="elevated" titleText="常用模板" extra="管理 ›">
        <Row gap="small" wrap>
          <Text color="secondary" size="sm">
            早餐 ¥12
          </Text>
          <Text color="secondary" size="sm">
            地铁 ¥4
          </Text>
        </Row>
      </Card>
      <Card variant="summary">
        <Column gap="small">
          <Text color="secondary" size="sm">
            本月结余
          </Text>
          <Text size="h2" weight="semibold">
            ¥8,420.15
          </Text>
          <Row gap="large">
            <Column gap="small">
              <Text color="tertiary" size="xs">
                收入
              </Text>
              <Text color="success" size="sm" weight="semibold">
                + ¥12,800.00
              </Text>
            </Column>
            <Column gap="small">
              <Text color="tertiary" size="xs">
                支出
              </Text>
              <Text color="error" size="sm" weight="semibold">
                − ¥4,379.85
              </Text>
            </Column>
          </Row>
        </Column>
      </Card>
    </Column>
  );
}

export default CardVariantsDemo;
