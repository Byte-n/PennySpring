import React from 'react';
import { Picker, Space } from '@pennyspring/ui';
import { DISABLED_TABS, EMPTY_TABS, EXPENSE_TABS } from './cascader-options';

export function PickerCascaderStateDemo() {
  return (
    <Space block direction="vertical" gap="large">
      <Picker.Cascader
        disabled
        labelText="不可选择"
        tabs={EXPENSE_TABS}
        titleText="禁用"
      />
      <Picker.Cascader
        defaultValue={{ daily: ['food', 'dinner'], fixed: ['home', 'rent'] }}
        labelText="禁用分类与选项"
        tabs={DISABLED_TABS}
        titleText="禁用选项"
      />
      <Picker.Cascader
        emptyText="暂无分类"
        labelText="暂无分类"
        tabs={EMPTY_TABS}
        titleText="空状态"
      />
      <Picker.Cascader
        labelText="加载状态"
        loading
        loadingIndicatorText="正在加载分类"
        tabs={EXPENSE_TABS}
        titleText="加载中"
      />
      <Picker.Cascader
        cancelText="关闭"
        labelText="自定义文案与选项标签"
        okDisabled
        okText="确认"
        renderLabel={item =>
          item.labelText
            ? `${item.labelText} - ${String(item.value)}`
            : String(item.value)
        }
        tabs={EXPENSE_TABS}
        titleText="自定义标题"
      />
    </Space>
  );
}

export default PickerCascaderStateDemo;
