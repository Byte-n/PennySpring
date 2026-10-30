import React from 'react';
import { ListPicker, Space } from '@pennyspring/ui';
import { CATEGORY_OPTIONS } from './options';

export const listPickerStatesDemoTitle = 'Disabled, readonly and validation';

export function ListPickerStatesDemo() {
  return (
    <Space direction="vertical" size="large">
      <ListPicker
        labelText="禁用状态"
        value="food"
        options={CATEGORY_OPTIONS}
        disabled
        texts={{ headerText: '选择消费类别' }}
      />
      <ListPicker
        labelText="只读状态"
        value="transport"
        options={CATEGORY_OPTIONS}
        readonly
        texts={{ headerText: '选择消费类别' }}
      />
      <ListPicker
        labelText="错误状态"
        options={CATEGORY_OPTIONS}
        status="error"
        texts={{ headerText: '选择消费类别' }}
      />
      <ListPicker
        allowClear
        defaultValue="food"
        labelText="可清除状态"
        options={CATEGORY_OPTIONS}
        texts={{ headerText: '选择消费类别' }}
      />
    </Space>
  );
}

export default ListPickerStatesDemo;
