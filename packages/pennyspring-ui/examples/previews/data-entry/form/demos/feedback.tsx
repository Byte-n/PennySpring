import React from 'react';
import { Form, Input, Text } from '@pennyspring/ui';

interface FeedbackValues {
  amount: string;
  nickname: string;
  remark: string;
}

const TypedForm = Form.infer<FeedbackValues>();

function renderRemarkError(message: string) {
  return <Text color="error" size="sm">{`注意：${message}`}</Text>;
}

export function FormFeedbackDemo() {
  const [form] = TypedForm.useForm();

  return (
    <TypedForm
      form={form}
      initialValues={{ amount: '', nickname: '', remark: '' }}
    >
      <Text color="description" size="sm">
        required 在未传 rules 时自动校验；extra 展示说明，errorRender
        自定义错误内容，noStyle 字段仍会渲染错误。
      </Text>
      <TypedForm.Item
        labelText="金额"
        name="amount"
        required
        requiredMessage="金额不能为空"
      >
        <Input keyboardType="decimal-pad" placeholder="0.00" />
      </TypedForm.Item>
      <TypedForm.Item
        errorRender={renderRemarkError}
        extraText="最多 10 个字"
        labelText="备注"
        name="remark"
        rules={value =>
          value.length > 10 ? '备注最多 10 个字' : undefined
        }
      >
        <Input placeholder="请输入备注" />
      </TypedForm.Item>
      <Text color="description" size="sm">
        昵称使用 noStyle：不渲染 label 和布局，但错误仍显示在输入框下方。
      </Text>
      <TypedForm.Item name="nickname" noStyle required>
        <Input placeholder="昵称（noStyle）" />
      </TypedForm.Item>
    </TypedForm>
  );
}

export default FormFeedbackDemo;
