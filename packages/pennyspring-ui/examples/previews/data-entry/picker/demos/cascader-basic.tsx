import React from 'react';
import { Picker, Space } from '@pennyspring/ui';
import { EXPENSE_TABS } from './cascader-options';

export const pickerCascaderBasicDemoTitle = '基础用法';

export function PickerCascaderBasicDemo() {
  return (
    <Space block direction="vertical" size="large">
      <Picker.Cascader
        defaultValue={{
          daily: ['food', 'breakfast'],
          fixed: ['home', 'rent'],
        }}
        labelText="选择分类"
        tabs={EXPENSE_TABS}
        titleText="分类"
      />
      <Picker.Cascader
        defaultValue={{
          daily: ['traffic', 'metro'],
          fixed: ['home', 'utilities'],
        }}
        labelText="选择固定支出"
        tabs={EXPENSE_TABS}
        titleText="固定支出"
      />
    </Space>
  );
}

export default PickerCascaderBasicDemo;
