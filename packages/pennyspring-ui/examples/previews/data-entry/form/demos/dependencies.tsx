import React from 'react';
import { Form, Input, Segmented, Text } from '@pennyspring/ui';

interface DependencyValues {
  mode: string;
  reason: string;
  remark: string;
}

const TypedForm = Form.infer<DependencyValues>();

const modeOptions = [
  { labelText: '普通', value: 'loose' },
  { labelText: '严格', value: 'strict' },
];

export function FormDependenciesDemo() {
  const [form] = TypedForm.useForm();

  return (
    <TypedForm
      form={form}
      initialValues={{ mode: 'loose', reason: '', remark: '' }}
    >
      <Text color="description" size="sm">
        备注通过 dependencies 跟随模式重新校验；原因字段通过 Form.Subscribe
        仅在严格模式挂载。
      </Text>
      <TypedForm.Subscribe selector={state => state.values.mode}>
        {mode => (
          <>
            <TypedForm.Item labelText="模式" name="mode">
              <Segmented block options={modeOptions} />
            </TypedForm.Item>
            <TypedForm.Item
              dependencies={['mode']}
              labelText="备注"
              name="remark"
              required={mode === 'strict'}
              rules={
                mode === 'strict'
                  ? value =>
                      value.trim() === '' ? '严格模式必须填写备注' : undefined
                  : undefined
              }
            >
              <Input
                placeholder={mode === 'strict' ? '严格模式必填' : '可选填写'}
              />
            </TypedForm.Item>
            {mode === 'strict' ? (
              <TypedForm.Item labelText="原因" name="reason" required>
                <Input placeholder="请输入严格模式原因" />
              </TypedForm.Item>
            ) : null}
          </>
        )}
      </TypedForm.Subscribe>
    </TypedForm>
  );
}

export default FormDependenciesDemo;
