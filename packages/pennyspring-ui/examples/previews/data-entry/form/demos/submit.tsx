import React from 'react';
import { Button, Form, Input } from '@pennyspring/ui';

interface SubmitValues {
  remark: string;
}

const TypedForm = Form.infer<SubmitValues>();

const requiredRule = (value: string): string | undefined =>
  value.trim() === '' ? '请输入备注' : undefined;

export const formSubmitDemoTitle = '提交与加载态';

export function FormSubmitDemo() {
  const [form] = TypedForm.useForm();

  return (
    <TypedForm
      form={form}
      initialValues={{ remark: '' }}
      onFinish={async () => {
        await new Promise(resolve => setTimeout(() => resolve, 600));
      }}
    >
      <TypedForm.Item labelText="备注" name="remark" rules={requiredRule}>
        <Input placeholder="请输入备注" />
      </TypedForm.Item>
      <TypedForm.Subscribe selector={state => state.isSubmitting}>
        {isSubmitting => (
          <Button
            loading={isSubmitting}
            onPress={() => {
              form.handleSubmit();
            }}
            type="primary"
          >
            提交
          </Button>
        )}
      </TypedForm.Subscribe>
    </TypedForm>
  );
}

export default FormSubmitDemo;
