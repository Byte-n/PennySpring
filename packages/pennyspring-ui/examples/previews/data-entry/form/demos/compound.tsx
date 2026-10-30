import React from 'react';
import { Button, Form, Input, Row, Text } from '@pennyspring/ui';

interface CompoundValues {
  amount: number;
}

const TypedForm = Form.infer<CompoundValues>();

function MoneyField() {
  const field = TypedForm.Item.useFieldProps<number>({});
  const amount = field.value ?? 0;

  return (
    <Row align="center" gap="small">
      <TypedForm.Item.Scope>
        <Input readonly value={`${amount} 元`} />
      </TypedForm.Item.Scope>
      <Button
        onPress={() => {
          field.onChange?.(amount + 1);
        }}
      >
        +1
      </Button>
    </Row>
  );
}

export const formCompoundDemoTitle = '复合控件隔断';

export function FormCompoundDemo() {
  const [form] = TypedForm.useForm();

  return (
    <TypedForm form={form} initialValues={{ amount: 0 }}>
      <Text color="description" size="sm">
        复合控件内部通过 Form.Item.Scope 隔断，内层 Input 不重复绑定字段。
      </Text>
      <TypedForm.Item labelText="金额" name="amount">
        <MoneyField />
      </TypedForm.Item>
    </TypedForm>
  );
}

export default FormCompoundDemo;
