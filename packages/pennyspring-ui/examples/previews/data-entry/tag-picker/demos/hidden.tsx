import React, { useState } from 'react';
import { Column, TagPicker, Text } from '@pennyspring/ui';
import type { TagPickerValue } from '@pennyspring/ui';
import { TAG_PICKER_OPTIONS } from './options';

export function TagPickerHiddenDemo() {
  const [value, setValue] = useState<TagPickerValue[]>(['food', 'archived']);

  return (
    <Column>
      <TagPicker
        labelText="标签"
        options={TAG_PICKER_OPTIONS}
        value={value}
        onChange={setValue}
        texts={{
          optionsTitle: '可选标签',
          hiddenOptionsTitle: '已隐藏标签',
        }}
      />
      <Text color="description">
        标记为 hidden 的选项不会出现在默认分组，选中后单独归入隐藏分组。
      </Text>
    </Column>
  );
}

export default TagPickerHiddenDemo;
