import React from 'react';
import { Column, Icon, Segmented, Text } from '@pennyspring/ui';

export function SegmentedContentDemo() {
  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        纯文字：默认组合，标签不超过 4 个汉字
      </Text>
      <Segmented
        defaultValue="list"
        options={[
          { label: '列表', value: 'list' },
          { label: '图表', value: 'chart' },
        ]}
      />
      <Text color="tertiary" size="sm">
        图标 + 文字：图标 14 / 16 / 18，与文字 gap 6
      </Text>
      <Segmented
        defaultValue="income"
        options={[
          {
            icon: <Icon color="secondary" icon="list" size="small" />,
            label: '明细',
            value: 'list',
          },
          {
            icon: <Icon color="secondary" icon="star" size="small" />,
            label: '重点',
            value: 'star',
          },
        ]}
        size="large"
      />
      <Text color="tertiary" size="sm">
        仅图标：用于图表视图切换，item 最小宽度 64
      </Text>
      <Segmented
        defaultValue="list"
        options={[
          {
            icon: <Icon color="secondary" icon="list" size="normal" />,
            value: 'list',
          },
          {
            icon: <Icon color="secondary" icon="image" size="normal" />,
            value: 'image',
          },
        ]}
      />
    </Column>
  );
}

export default SegmentedContentDemo;
