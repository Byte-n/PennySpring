import React from 'react';
import { Checkbox, Column, Text } from '@pennyspring/ui';
import type { CheckboxGroupOption, CheckboxValue } from '@pennyspring/ui';

export const checkboxGroupDemoTitle = '组排布（Group）';

const SAVE_OPTIONS: CheckboxGroupOption[] = [
  { label: '保存记录', value: 'record' },
  { label: '存为模板', value: 'template' },
  { label: '静默保存', value: 'silent', disabled: true },
];

const LEDGER_OPTIONS: CheckboxGroupOption[] = [
  { label: '日常账本', value: 'daily' },
  { label: '旅行账本', value: 'travel' },
  { label: '家庭账本', value: 'family' },
];

export function CheckboxGroupDemo() {
  const [selectedValues, setSelectedValues] = React.useState<CheckboxValue[]>([
    'record',
  ]);

  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        横纵统一 gap 8；option 标签优先级 label &gt; labelText &gt; value
      </Text>
      <Text color="tertiary" size="sm">横向（默认，自动换行）</Text>
      <Checkbox.Group
        options={SAVE_OPTIONS}
        value={selectedValues}
        onChange={setSelectedValues}
      />
      <Text color="tertiary" size="sm">纵向（每行 44 行高）</Text>
      <Checkbox.Group direction="vertical" options={LEDGER_OPTIONS} defaultValue={['daily']} />
      <Text color="tertiary" size="sm">block（整组铺满宽度）</Text>
      <Checkbox.Group block direction="vertical" options={LEDGER_OPTIONS} defaultValue={['travel']} />
      <Text color="tertiary" size="sm">只读组与禁用组</Text>
      <Checkbox.Group readonly options={LEDGER_OPTIONS} defaultValue={['daily', 'travel']} />
      <Checkbox.Group disabled options={LEDGER_OPTIONS} defaultValue={['family']} />
      <Text color="tertiary" size="sm">
        当前已选：{selectedValues.join('、') || '无'}
      </Text>
    </Column>
  );
}

export default CheckboxGroupDemo;
