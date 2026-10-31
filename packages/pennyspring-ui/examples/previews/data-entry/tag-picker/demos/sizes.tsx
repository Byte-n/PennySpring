import React from 'react';
import { Space, TagPicker } from '@pennyspring/ui';
import { TAG_PICKER_OPTIONS } from './options';

export function TagPickerSizesDemo() {
  return (
    <Space direction="vertical" gap="large">
      <TagPicker
        labelText="小尺寸"
        size="small"
        options={TAG_PICKER_OPTIONS}
        defaultValue={['food']}
        texts={{ optionsTitle: '可选标签' }}
      />
      <TagPicker
        labelText="常规尺寸"
        size="normal"
        options={TAG_PICKER_OPTIONS}
        defaultValue={['food', 'transport']}
        texts={{ optionsTitle: '可选标签' }}
      />
      <TagPicker
        labelText="大尺寸"
        size="large"
        options={TAG_PICKER_OPTIONS}
        defaultValue={['food']}
        texts={{ optionsTitle: '可选标签' }}
      />
    </Space>
  );
}

export default TagPickerSizesDemo;
