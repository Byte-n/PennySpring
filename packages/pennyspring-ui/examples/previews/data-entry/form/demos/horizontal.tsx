import React from 'react';
import { Form, Input } from '@pennyspring/ui';

interface LayoutValues {
  account: string;
  amount: string;
}

const TypedForm = Form.infer<LayoutValues>();

export const formHorizontalDemoTitle = '水平布局';

export function FormHorizontalDemo() {
  const form = TypedForm.useForm({
    defaultValues: { account: '', amount: '' },
  });

  return (
    <TypedForm form={form} labelAlign="right" labelWidth={96} layout="horizontal">
      <TypedForm.Item labelText="账户" name="account">
        <Input placeholder="请输入账户" />
      </TypedForm.Item>
      <TypedForm.Item labelText="金额" name="amount">
        <Input keyboardType="decimal-pad" placeholder="0.00" />
      </TypedForm.Item>
    </TypedForm>
  );
}

export default FormHorizontalDemo;
