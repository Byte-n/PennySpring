import React, { useState } from 'react';
import { Column, ListPicker, Text } from '@pennyspring/ui';
import type { ListPickerValue } from '@pennyspring/ui';
import { CATEGORY_OPTIONS } from './options';

export function ListPickerSingleDemo() {
  const [value, setValue] = useState<ListPickerValue>('food');

  return (
    <Column>
      <ListPicker
        labelText="消费类别"
        options={CATEGORY_OPTIONS}
        searchable
        value={value}
        onChange={nextValue => {
          if (!Array.isArray(nextValue)) setValue(nextValue);
        }}
        texts={{
          headerText: '选择消费类别',
          searchLabelText: '搜索类别',
          searchPlaceholder: '输入名称查找',
          emptyText: '没有匹配的类别',
        }}
      />
      <Text color="description">当前选择：{String(value)}</Text>
    </Column>
  );
}

export default ListPickerSingleDemo;
