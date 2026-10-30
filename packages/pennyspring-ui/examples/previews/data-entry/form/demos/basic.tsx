import React from 'react';
import { Form, Input, Text, Textarea } from '@pennyspring/ui';

interface BasicValues {
  name: string;
  nickname: string;
  remark: string;
}

const TypedForm = Form.infer<BasicValues>();

export function FormBasicDemo() {
  const [form] = TypedForm.useForm();

  return (
    <TypedForm
      form={form}
      initialValues={{ name: '', nickname: '', remark: '' }}
    >
      <TypedForm.Item
        labelText="名称"
        name="name"
        required
        rules={value => (value.trim() === '' ? '请输入名称' : undefined)}
      >
        <Input placeholder="请输入名称" />
      </TypedForm.Item>
      <TypedForm.Item labelMode="child" labelText="备注" name="remark">
        <Textarea maxLength={100} placeholder="请输入备注" showCount />
      </TypedForm.Item>
      <Text color="description" size="sm">
        noStyle 字段只注册字段与状态，不渲染 label 和布局，但错误仍会显示。
      </Text>
      <TypedForm.Item name="nickname" noStyle>
        <Input placeholder="昵称（noStyle）" />
      </TypedForm.Item>
    </TypedForm>
  );
}

export default FormBasicDemo;
