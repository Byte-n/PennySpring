import React from 'react';
import { Column, Radio, Text } from '@pennyspring/ui';
import type { RadioGroupOption, RadioGroupValue } from '@pennyspring/ui';

const STAT_OPTIONS: RadioGroupOption[] = [
  { label: '按分类统计', value: 'category' },
  { label: '按标签统计', value: 'tag' },
  { label: '按账户统计', value: 'account' },
];

const TYPE_OPTIONS: RadioGroupOption[] = [
  { label: '支出', value: 'expense' },
  { label: '收入', value: 'income' },
  { label: '转账', value: 'transfer' },
];

const LOCKED_OPTIONS: RadioGroupOption[] = [
  { label: '关闭后不可修改', value: 'locked' },
  { label: '需在设置中开启', value: 'settings' },
];

export function RadioGroupDemo() {
  const [stat, setStat] = React.useState<RadioGroupValue>('category');

  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        组内互斥，已选项再点不取消；option 标签优先级 label &gt; labelText &gt;
        value
      </Text>
      <Text color="tertiary" size="sm">
        纵向（每项行高 44 + 组间距，一屏不超过 4 项，超过改用 Picker）
      </Text>
      <Radio.Group
        direction="vertical"
        options={STAT_OPTIONS}
        value={stat}
        onChange={setStat}
      />
      <Text color="tertiary" size="sm">
        横向（gap 8 自动换行，超过 3 项改纵向）
      </Text>
      <Radio.Group size="small" options={TYPE_OPTIONS} defaultValue="expense" />
      <Text color="tertiary" size="sm">
        block（整组铺满宽度）
      </Text>
      <Radio.Group
        block
        direction="vertical"
        options={STAT_OPTIONS}
        defaultValue="tag"
      />
      <Text color="tertiary" size="sm">
        组级禁用逐项降级，不给整组 opacity
      </Text>
      <Radio.Group
        disabled
        direction="vertical"
        options={LOCKED_OPTIONS}
        defaultValue="locked"
      />
      <Text color="tertiary" size="sm">
        当前统计方式：{String(stat)}
      </Text>
    </Column>
  );
}

export default RadioGroupDemo;
