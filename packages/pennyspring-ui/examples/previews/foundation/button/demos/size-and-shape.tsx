import React from 'react';
import { Button, Column, Row, Space, Text } from '@pennyspring/ui';
import { PlusIcon } from 'phosphor-react-native';

export const buttonSizeAndShapeDemoTitle = '尺寸、形状与图标位';

const SIZES = [
  { value: 'small', label: 'small · 32 / 圆角 8' },
  { value: 'normal', label: 'normal · 44 / 圆角 12' },
  { value: 'large', label: 'large · 52 / 圆角 16' },
] as const;

export function ButtonSizeAndShapeDemo() {
  return (
    <Column gap="normal">
      {SIZES.map(({ label, value }) => (
        <Space key={value} direction="vertical" size="small" align="start">
          <Text color="secondary" size="sm">
            {label}
          </Text>
          <Space align="center" size="normal" wrap>
            <Button size={value} type="primary">
              保存记录
            </Button>
            <Button size={value}>存为模板</Button>
            <Button size={value} type="text">
              跳过
            </Button>
          </Space>
        </Space>
      ))}

      <Space direction="vertical" size="small" align="start">
        <Text color="secondary" size="sm">
          shape：default / round（999）/ circle（宽高等于高度）
        </Text>
        <Space align="center" size="normal" wrap>
          <Button type="primary">default</Button>
          <Button shape="round" type="primary">
            round
          </Button>
          <Button icon={PlusIcon} shape="circle" />
          <Button icon={PlusIcon} shape="circle" size="small" />
          <Button icon={PlusIcon} shape="circle" size="large" type="primary" />
        </Space>
      </Space>

      <Space direction="vertical" size="small" align="start">
        <Text color="secondary" size="sm">
          iconPlacement：start / end，图标 16 / 18 / 20
        </Text>
        <Row gap="normal">
          <Button icon="add" type="primary">
            记一笔
          </Button>
          <Button icon="arrow-right" iconPlacement="end">
            下一步
          </Button>
          <Button icon="filter" type="text">
            筛选
          </Button>
        </Row>
      </Space>
    </Column>
  );
}

export default ButtonSizeAndShapeDemo;
