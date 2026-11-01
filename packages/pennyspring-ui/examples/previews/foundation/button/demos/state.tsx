import React from 'react';
import { Button, Column, Space, Text } from '@pennyspring/ui';

export function ButtonStateDemo() {
  return (
    <Column gap="normal">
      <Space direction="vertical" gap="small" align="start">
        <Text color="secondary" size="sm">
          按压：底色深一档 + scale(.97)，不改变占位尺寸；按住任意按钮可查看
        </Text>
        <Space align="center" gap="large" wrap>
          <Button type="primary">保存记录</Button>
          <Button>存为模板</Button>
          <Button type="text">跳过</Button>
        </Space>
      </Space>

      <Space direction="vertical" gap="small" align="start">
        <Text color="secondary" size="sm">
          loading：图标位显示转圈，保留文案并降到
          opacityLoading（0.65），期间不可点
        </Text>
        <Space align="center" gap="large" wrap>
          <Button loading type="primary">
            保存记录
          </Button>
          <Button loading>存为模板</Button>
          <Button loading={{ delay: 400 }} type="primary">
            延迟 400ms 出现
          </Button>
        </Space>
      </Space>

      <Space direction="vertical" gap="small" align="start">
        <Text color="secondary" size="sm">
          disabled：统一浅底 + colorTextQuaternary，不再叠 disabled 描边
        </Text>
        <Space align="center" gap="large" wrap>
          <Button disabled type="primary">
            保存记录
          </Button>
          <Button disabled>存为模板</Button>
          <Button disabled variant="outlined">
            取消
          </Button>
          <Button disabled type="text">
            跳过
          </Button>
        </Space>
      </Space>

      <Space direction="vertical" gap="small" align="start">
        <Text color="secondary" size="sm">
          ghost：solid 降级为 outlined；Button 没有 readonly 语义，用 disabled +
          文案说明
        </Text>
        <Space align="center" gap="large" wrap>
          <Button ghost>幽灵按钮</Button>
          <Button ghost type="primary">
            幽灵主操作
          </Button>
        </Space>
      </Space>
    </Column>
  );
}

export default ButtonStateDemo;
