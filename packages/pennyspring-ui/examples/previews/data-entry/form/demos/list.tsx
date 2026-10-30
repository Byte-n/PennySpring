import React from 'react';
import { Button, Form, Input, Row, Text } from '@pennyspring/ui';

interface ListValues {
  items: Array<{ amount: string }>;
}

const TypedForm = Form.infer<ListValues>();

export const formListDemoTitle = '动态字段列表';

export function FormListDemo() {
  const [form] = TypedForm.useForm();

  return (
    <TypedForm form={form} initialValues={{ items: [{ amount: '' }] }}>
      <Text color="description" size="sm">
        通过 Form.List 增删、移动明细行；字段名和表单值会自动跟随行索引。
      </Text>
      <TypedForm.List name="items">
        {(fields, { add, move, remove }) => (
          <>
            {fields.map(field => (
              <React.Fragment key={field.key}>
                <TypedForm.Item
                  labelText={`金额 ${field.index + 1}`}
                  name={field.name('amount')}
                >
                  <Input keyboardType="decimal-pad" placeholder="0.00" />
                </TypedForm.Item>
                <Row gap="small">
                  <Button
                    onPress={() => {
                      remove(field.index);
                    }}
                    size="small"
                  >
                    删除
                  </Button>
                  <Button
                    disabled={field.index === fields.length - 1}
                    onPress={() => {
                      move(field.index, field.index + 1);
                    }}
                    size="small"
                  >
                    下移
                  </Button>
                </Row>
              </React.Fragment>
            ))}
            <Button
              onPress={() => {
                add({ amount: '' });
              }}
              type="primary"
            >
              添加一行
            </Button>
          </>
        )}
      </TypedForm.List>
    </TypedForm>
  );
}

export default FormListDemo;
