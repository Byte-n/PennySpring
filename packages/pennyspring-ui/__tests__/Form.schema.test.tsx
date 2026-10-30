import React from 'react';
import { TextInput } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { z } from 'zod';
import { Input } from '../src/Input';
import { Form } from '../src/Form';
import type { FormItemProps } from '../src/Form';

interface SchemaValues {
  remark: string;
}

const TypedForm = Form.infer<SchemaValues>();
const { Item: FormItem, useForm } = TypedForm;

const schema = z.object({
  remark: z.string().min(1, '表单级必填'),
});

function renderSchemaForm(
  itemProps: Partial<FormItemProps<SchemaValues, 'remark'>> = {},
) {
  let testRenderer: renderer.ReactTestRenderer;
  let formApi: ReturnType<typeof useForm> | undefined;

  function Harness() {
    const form = useForm({
      defaultValues: { remark: '' },
      validators: { onSubmit: schema },
    });

    formApi = form;

    return (
      <TypedForm form={form}>
        <FormItem labelText="备注" name="remark" {...itemProps}>
          <Input />
        </FormItem>
      </TypedForm>
    );
  }

  act(() => {
    testRenderer = renderer.create(<Harness />);
  });

  return { testRenderer: testRenderer!, getForm: () => formApi! };
}

function errorCount(testRenderer: renderer.ReactTestRenderer): number {
  return testRenderer.root.findAll(
    instance => instance.props.testID === 'form-item-error',
  ).length;
}

const ASYNC_WAIT_ATTEMPTS = 20;

async function waitForText(
  testRenderer: renderer.ReactTestRenderer,
  text: string,
): Promise<void> {
  for (let attempt = 0; attempt < ASYNC_WAIT_ATTEMPTS; attempt += 1) {
    if (JSON.stringify(testRenderer.toJSON()).includes(text)) {
      return;
    }

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
  }
}

describe('Form schema validation', () => {
  it('renders form-level schema errors inside the item after submit', async () => {
    const { testRenderer, getForm } = renderSchemaForm({
      validateTrigger: 'onSubmit',
    });

    await act(async () => {
      await getForm().handleSubmit();
    });

    expect(errorCount(testRenderer)).toBeGreaterThan(0);
    expect(JSON.stringify(testRenderer.toJSON())).toContain('表单级必填');
  });

  it('supports async field rules', async () => {
    const { testRenderer } = renderSchemaForm({
      rules: async (value: string) => {
        await Promise.resolve();

        return value === '' ? '异步错误' : undefined;
      },
    });

    await act(async () => {
      testRenderer.root.findByType(TextInput).props.onChangeText('');
    });

    await waitForText(testRenderer, '异步错误');

    expect(JSON.stringify(testRenderer.toJSON())).toContain('异步错误');
  });
});
