import React from 'react';
import { Picker, Space, Text } from '@pennyspring/ui';
import type { PickerCascaderValue } from '@pennyspring/ui';
import { EXPENSE_TABS, type ExpenseTabKey } from './cascader-options';

function joinLabels(labels: Array<string | undefined>): string {
  const visibleLabels = labels.filter((label): label is string =>
    label !== undefined && label.length > 0,
  );

  if (visibleLabels.length === 0) {
    return '未选择';
  }

  return visibleLabels.join(' / ');
}

export function PickerCascaderControlledDemo() {
  const [controlledValue, setControlledValue] = React.useState<
    PickerCascaderValue<ExpenseTabKey>
  >({
    daily: ['traffic', 'metro'],
    fixed: ['home', 'rent'],
  });
  const [controlledSummary, setControlledSummary] = React.useState(
    '交通 / 地铁',
  );

  return (
    <Space block direction="vertical" size="large">
      <Picker.Cascader
        labelText="选择分类路径"
        tabs={EXPENSE_TABS}
        titleText="受控分类"
        value={controlledValue}
        onChange={nextValue => setControlledValue(nextValue)}
        onOk={(_nextValue, params) => {
          setControlledSummary(joinLabels(params.path.map(item => item.labelText)));
        }}
      />
      <Text color="description" size="sm">
        当前选择：{controlledSummary}
      </Text>
    </Space>
  );
}

export default PickerCascaderControlledDemo;
