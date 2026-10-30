import React from 'react';
import { Button, Form, Input } from '@pennyspring/ui';

interface ValidationValues {
  blur: string;
  change: string;
  submit: string;
}

const TypedForm = Form.infer<ValidationValues>();

const requiredRule = (value: string): string | undefined =>
  value.trim() === '' ? '该字段不能为空' : undefined;

export function FormValidationDemo() {
  const [form] = TypedForm.useForm();

  return (
    <TypedForm
      form={form}
      initialValues={{ blur: '', change: '', submit: '' }}
    >
      <TypedForm.Item labelText="onChange" name="change" rules={requiredRule}>
        <Input placeholder="输入后立即校验" />
      </TypedForm.Item>
      <TypedForm.Item
        labelText="onBlur"
        name="blur"
        rules={requiredRule}
        validateTrigger="onBlur"
      >
        <Input placeholder="失焦后校验" />
      </TypedForm.Item>
      <TypedForm.Item
        labelText="onSubmit"
        name="submit"
        rules={requiredRule}
        validateTrigger="onSubmit"
      >
        <Input placeholder="提交后校验" />
      </TypedForm.Item>
      <Button
        type="primary"
        onPress={() => {
          form.handleSubmit();
        }}
      >
        提交
      </Button>
    </TypedForm>
  );
}

export default FormValidationDemo;
