import React from 'react';
import { Space, TagPicker } from '@pennyspring/ui';
import { TAG_PICKER_OPTIONS } from './options';

export function TagPickerStatesDemo() {
  return (
    <Space direction="vertical" size="large">
      <TagPicker
        disabled
        labelText="禁用状态"
        options={TAG_PICKER_OPTIONS}
        defaultValue={['food']}
        texts={{ optionsTitle: '可选标签' }}
      />
      <TagPicker
        loading
        labelText="加载状态"
        options={[]}
        texts={{ loadingText: '正在加载标签' }}
      />
      <TagPicker
        labelText="空状态"
        options={[]}
        texts={{ optionsTitle: '可选标签', emptyText: '暂无可用标签' }}
      />
    </Space>
  );
}

export default TagPickerStatesDemo;
