import React from 'react';
import { Column, Segmented, Text } from '@pennyspring/ui';
import type { SegmentedValue } from '@pennyspring/ui';

const OPTIONS = [
  { label: '按分类', value: 'category' },
  { label: '按标签', value: 'tag' },
  { label: '按账户', value: 'account' },
];

export function SegmentedBlockDemo() {
  const [value, setValue] = React.useState<SegmentedValue>('tag');

  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        block 时 item 等分整行；文字过长省略不换行；最后一行不留空位
      </Text>
      <Segmented block onChange={setValue} options={OPTIONS} value={value} />
      <Text color="tertiary" size="sm">
        当前选中：{String(value)}
      </Text>
      <Text color="tertiary" size="sm">
        自动宽度：不占满整行，靠左对齐，item 最小宽度 64
      </Text>
      <Segmented
        defaultValue="all"
        options={[
          { label: '全部', value: 'all' },
          { label: '本月', value: 'month' },
        ]}
      />
    </Column>
  );
}

export default SegmentedBlockDemo;
