import React, { useState } from 'react';
import { Column, ListPicker, Text } from '@pennyspring/ui';
import type { ListPickerValue } from '@pennyspring/ui';
import { CATEGORY_OPTIONS } from './options';

export function ListPickerMultipleDemo() {
  const [value, setValue] = useState<ListPickerValue[]>(['food', 'transport']);

  return (
    <Column>
      <ListPicker
        labelText="常用类别"
        mode="multiple"
        options={CATEGORY_OPTIONS}
        displayMode="tag"
        value={value}
        onChange={nextValue => {
          setValue(
            Array.isArray(nextValue)
              ? nextValue
              : nextValue === undefined
                ? []
                : [nextValue],
          );
        }}
        texts={{
          headerText: '选择常用类别',
          confirmText: '完成',
          closeText: '取消',
          emptyText: '暂无可选类别',
        }}
      />
      <Text color="description">
        已选 {value.length} 项：{value.join('、')}
      </Text>
    </Column>
  );
}

export default ListPickerMultipleDemo;
