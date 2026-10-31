import React from 'react';
import { ListPicker, Space } from '@pennyspring/ui';
import { CATEGORY_OPTIONS } from './cascader-options';

export function ListPickerCascaderBasicDemo() {
  return (
    <Space block direction="vertical" gap="large">
      <ListPicker.Cascader
        defaultValue={['daily', 'traffic', 'metro']}
        labelText="选择分类"
        options={CATEGORY_OPTIONS}
        texts={{ headerText: '选择支出分类', tabPlaceholderText: '请选择' }}
      />
      <ListPicker.Cascader
        activeLevel={1}
        defaultValue={['daily']}
        labelText="指定层级"
        options={CATEGORY_OPTIONS}
        texts={{ tabPlaceholderText: '请选择' }}
      />
      <ListPicker.Cascader
        defaultValue={['fixed', 'housing', 'utilities']}
        displayMode="tag"
        labelText="标签展示"
        options={CATEGORY_OPTIONS}
      />
      <ListPicker.Cascader
        defaultValue={['daily', 'food', 'breakfast']}
        labelText="小尺寸"
        options={CATEGORY_OPTIONS}
        size="small"
      />
      <ListPicker.Cascader
        defaultValue={['daily', 'food', 'dinner']}
        labelText="大尺寸"
        options={CATEGORY_OPTIONS}
        size="large"
      />
    </Space>
  );
}

export default ListPickerCascaderBasicDemo;
