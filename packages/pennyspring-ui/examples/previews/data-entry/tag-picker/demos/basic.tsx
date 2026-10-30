import React, { useState } from 'react';
import { Column, TagPicker, Text } from '@pennyspring/ui';
import type { TagPickerValue } from '@pennyspring/ui';
import { TAG_PICKER_OPTIONS } from './options';

export function TagPickerBasicDemo() {
  const [value, setValue] = useState<TagPickerValue[]>(['food', 'transport']);

  return (
    <Column>
      <TagPicker
        labelText="常用标签"
        options={TAG_PICKER_OPTIONS}
        value={value}
        onChange={setValue}
        texts={{
          optionsTitle: '可选标签',
          hiddenOptionsTitle: '已隐藏标签',
          emptyText: '暂无可选标签',
          loadingText: '正在加载标签',
        }}
      />
      <Text color="description">已选 {value.length} 个标签</Text>
    </Column>
  );
}

export default TagPickerBasicDemo;
