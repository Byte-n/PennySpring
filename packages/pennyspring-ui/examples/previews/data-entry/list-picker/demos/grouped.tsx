import React, { useState } from 'react';
import { ListPicker } from '@pennyspring/ui';
import type { ListPickerValue } from '@pennyspring/ui';
import { GROUPED_OPTIONS } from './options';

export const listPickerGroupedDemoTitle = 'Grouped options';

export function ListPickerGroupedDemo() {
  const [value, setValue] = useState<ListPickerValue>('housing');

  return (
    <ListPicker
      labelText="分组选择"
      groups={GROUPED_OPTIONS}
      searchable
      value={value}
      onChange={nextValue => {
        if (!Array.isArray(nextValue)) setValue(nextValue);
      }}
      texts={{
        headerText: '选择分类',
        searchLabelText: '搜索分类',
        searchPlaceholder: '搜索全部分组',
        emptyText: '暂无搜索结果',
      }}
    />
  );
}

export default ListPickerGroupedDemo;
