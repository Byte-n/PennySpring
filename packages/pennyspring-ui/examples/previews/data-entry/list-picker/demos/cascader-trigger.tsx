import React from 'react';
import { ListPicker, Space } from '@pennyspring/ui';
import { CATEGORY_OPTIONS } from './cascader-options';

export function ListPickerCascaderTriggerDemo() {
  return (
    <Space block direction="vertical" gap="large">
      <ListPicker.Cascader
        allowClear
        defaultValue={['daily', 'traffic', 'taxi']}
        labelText="可清除"
        options={CATEGORY_OPTIONS}
      />
      <ListPicker.Cascader
        disabled
        labelText="禁用"
        options={CATEGORY_OPTIONS}
      />
      <ListPicker.Cascader
        labelText="只读"
        options={CATEGORY_OPTIONS}
        readonly
      />
      <ListPicker.Cascader
        labelText="空状态"
        options={[]}
        texts={{ emptyText: '暂无选项' }}
      />
      <ListPicker.Cascader
        labelText="加载状态"
        loading
        options={CATEGORY_OPTIONS}
        texts={{ loadingText: '正在加载分类' }}
      />
      <ListPicker.Cascader
        labelText="错误状态"
        options={CATEGORY_OPTIONS}
        status="error"
      />
    </Space>
  );
}

export default ListPickerCascaderTriggerDemo;
