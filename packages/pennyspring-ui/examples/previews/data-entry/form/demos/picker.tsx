import React from 'react';
import { DisplayInput, Form, ListPicker, Picker } from '@pennyspring/ui';

interface PickerValues {
  account: Array<string | number>;
  category: string;
  display: string;
}

const categoryOptions = [
  { labelText: '餐饮', value: 'food' },
  { labelText: '交通', value: 'traffic' },
  { labelText: '购物', value: 'shopping' },
];

const accountColumns = [
  [
    { labelText: '现金', value: 'cash' },
    { labelText: '银行卡', value: 'bank' },
  ],
];

const TypedForm = Form.infer<PickerValues>();

export const formPickerDemoTitle = '选择器与展示';

export function FormPickerDemo() {
  const form = TypedForm.useForm({
    defaultValues: { account: [], category: '', display: '' },
  });

  return (
    <TypedForm form={form}>
      <TypedForm.Item
        labelText="分类"
        name="category"
        rules={value => (value === '' ? '请选择分类' : undefined)}
        validateTrigger="onSubmit"
      >
        <ListPicker options={categoryOptions} />
      </TypedForm.Item>
      <TypedForm.Item labelMode="child" labelText="账户" name="account">
        <Picker columns={accountColumns} />
      </TypedForm.Item>
      <TypedForm.Item labelMode="child" labelText="只读展示" name="display">
        <DisplayInput valueText="Form 内自动绑定状态" />
      </TypedForm.Item>
    </TypedForm>
  );
}

export default FormPickerDemo;
