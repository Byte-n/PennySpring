import React from 'react';
import { TextInput } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Checkbox } from '../src/Checkbox';
import { Input } from '../src/Input';
import { Form } from '../src/Form';
import { Text } from '../src/Text';
import type { ReactNode } from 'react';

interface P1Values {
  flag: boolean;
  mode: string;
  remark: string;
}

const TypedForm = Form.infer<P1Values>();
const { Item: FormItem, useForm } = TypedForm;

const DEFAULT_REQUIRED_ERROR = '请填写备注';

const requiredRule = (value: string): string | undefined =>
  value.trim() === '' ? '请输入备注' : undefined;

function renderForm(children: ReactNode) {
  let formApi: ReturnType<typeof useForm>[0] | undefined;

  function Harness() {
    const [form] = useForm();

    formApi = form;

    return (
      <TypedForm
        form={form}
        initialValues={{ flag: false, mode: 'loose', remark: '' }}
      >
        {children}
      </TypedForm>
    );
  }

  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<Harness />);
  });

  return {
    testRenderer: testRenderer!,
    getForm: () => formApi!,
  };
}

function findInputs(
  testRenderer: renderer.ReactTestRenderer,
): renderer.ReactTestInstance[] {
  return testRenderer.root.findAllByType(TextInput);
}

async function flushAsyncUpdates(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 0));
  await new Promise(resolve => setTimeout(resolve, 0));
}

async function changeInput(
  testRenderer: renderer.ReactTestRenderer,
  index: number,
  text: string,
): Promise<void> {
  await act(async () => {
    findInputs(testRenderer)[index].props.onChangeText(text);
    await flushAsyncUpdates();
  });
}

function json(testRenderer: renderer.ReactTestRenderer): string {
  return JSON.stringify(testRenderer.toJSON());
}

function countTestId(
  testRenderer: renderer.ReactTestRenderer,
  testID: string,
): number {
  return testRenderer.root.findAll(node => {
    if (node.props.testID !== testID) {
      return false;
    }

    let parent = node.parent;

    while (parent !== null) {
      if (parent.props.testID === testID) {
        return false;
      }

      parent = parent.parent;
    }

    return true;
  }).length;
}

afterEach(async () => {
  await act(async () => {
    await flushAsyncUpdates();
  });
});

describe('Form required validation', () => {
  it('auto-validates required fields that have no rules', async () => {
    const { testRenderer } = renderForm(
      <FormItem labelText="备注" name="remark" required>
        <Input />
      </FormItem>,
    );

    await changeInput(testRenderer, 0, 'a');
    expect(json(testRenderer)).not.toContain(DEFAULT_REQUIRED_ERROR);

    await changeInput(testRenderer, 0, '');
    expect(countTestId(testRenderer, 'form-item-error')).toBe(1);
    expect(json(testRenderer)).toContain(DEFAULT_REQUIRED_ERROR);
  });

  it('treats whitespace-only text as empty', async () => {
    const { testRenderer } = renderForm(
      <FormItem labelText="备注" name="remark" required>
        <Input />
      </FormItem>,
    );

    await changeInput(testRenderer, 0, '   ');

    expect(json(testRenderer)).toContain(DEFAULT_REQUIRED_ERROR);
  });

  it('uses requiredMessage when provided', async () => {
    const { testRenderer } = renderForm(
      <FormItem
        labelText="备注"
        name="remark"
        required
        requiredMessage="备注不能为空"
      >
        <Input />
      </FormItem>,
    );

    await changeInput(testRenderer, 0, '');

    expect(json(testRenderer)).toContain('备注不能为空');
    expect(json(testRenderer)).not.toContain(DEFAULT_REQUIRED_ERROR);
  });

  it('keeps the explicit rule message when rules are provided', async () => {
    const { testRenderer } = renderForm(
      <FormItem labelText="备注" name="remark" required rules={requiredRule}>
        <Input />
      </FormItem>,
    );

    await changeInput(testRenderer, 0, '');

    expect(json(testRenderer)).toContain('请输入备注');
    expect(json(testRenderer)).not.toContain(DEFAULT_REQUIRED_ERROR);
  });

  it('runs rules in order and shows the first error', async () => {
    const { testRenderer } = renderForm(
      <FormItem
        labelText="备注"
        name="remark"
        rules={[
          value => (value === '' ? '必填错误' : undefined),
          value => (value.length < 3 ? '长度错误' : undefined),
        ]}
      >
        <Input />
      </FormItem>,
    );

    await changeInput(testRenderer, 0, '');
    expect(json(testRenderer)).toContain('必填错误');

    await changeInput(testRenderer, 0, 'ab');
    expect(json(testRenderer)).toContain('长度错误');
    expect(json(testRenderer)).not.toContain('必填错误');

    await changeInput(testRenderer, 0, 'abc');
    expect(countTestId(testRenderer, 'form-item-error')).toBe(0);
  });

  it('does not treat false as an empty value', async () => {
    const { testRenderer } = renderForm(
      <FormItem name="flag" required>
        <Checkbox>同意</Checkbox>
      </FormItem>,
    );

    const checkbox = testRenderer.root.findAll(
      node =>
        node.props.testID === 'checkbox-control' &&
        typeof node.props.onPress === 'function',
    )[0];

    act(() => {
      checkbox.props.onPress();
    });
    act(() => {
      checkbox.props.onPress();
    });

    expect(countTestId(testRenderer, 'form-item-error')).toBe(0);
  });
});

describe('Form dependencies', () => {
  it('revalidates the field when a dependency changes', async () => {
    function conditionalRule(
      value: string,
      context: { values: P1Values },
    ): string | undefined {
      return context.values.mode === 'strict' && value.trim() === ''
        ? '严格模式必填'
        : undefined;
    }

    const { testRenderer } = renderForm(
      <>
        <FormItem name="mode">
          <Input />
        </FormItem>
        <FormItem
          dependencies={['mode']}
          labelText="备注"
          name="remark"
          rules={conditionalRule}
        >
          <Input />
        </FormItem>
      </>,
    );

    await changeInput(testRenderer, 1, 'ok');
    await changeInput(testRenderer, 1, '');
    expect(json(testRenderer)).not.toContain('严格模式必填');

    await changeInput(testRenderer, 0, 'strict');
    expect(json(testRenderer)).toContain('严格模式必填');
  });
});

describe('Form conditional rendering', () => {
  it('renders fields through Form.Subscribe selectors', async () => {
    const { testRenderer } = renderForm(
      <>
        <FormItem name="mode">
          <Input />
        </FormItem>
        <TypedForm.Subscribe selector={state => state.values.mode}>
          {mode =>
            mode === 'extra' ? (
              <FormItem name="remark">
                <Input />
              </FormItem>
            ) : (
              <Text testID="extra-off">未开启</Text>
            )
          }
        </TypedForm.Subscribe>
      </>,
    );

    expect(findInputs(testRenderer)).toHaveLength(1);
    expect(countTestId(testRenderer, 'extra-off')).toBe(1);

    await changeInput(testRenderer, 0, 'extra');
    expect(findInputs(testRenderer)).toHaveLength(2);
    expect(countTestId(testRenderer, 'extra-off')).toBe(0);

    await changeInput(testRenderer, 0, 'loose');
    expect(findInputs(testRenderer)).toHaveLength(1);
  });
});

describe('Form revalidation after submit', () => {
  it('revalidates submit-only fields on change after the first submit', async () => {
    const { testRenderer, getForm } = renderForm(
      <FormItem
        labelText="备注"
        name="remark"
        rules={requiredRule}
        validateTrigger="onSubmit"
      >
        <Input />
      </FormItem>,
    );

    await act(async () => {
      await getForm().handleSubmit();
    });
    expect(countTestId(testRenderer, 'form-item-error')).toBe(1);

    await changeInput(testRenderer, 0, 'ok');
    expect(countTestId(testRenderer, 'form-item-error')).toBe(0);

    await changeInput(testRenderer, 0, '');
    expect(countTestId(testRenderer, 'form-item-error')).toBe(1);
  });
});

describe('Form item feedback', () => {
  it('renders extraText below the control', () => {
    const { testRenderer } = renderForm(
      <FormItem extraText="最多 100 字" labelText="备注" name="remark">
        <Input />
      </FormItem>,
    );

    expect(countTestId(testRenderer, 'form-item-extra')).toBe(1);
    expect(json(testRenderer)).toContain('最多 100 字');
  });

  it('prefers a custom extra node over extraText', () => {
    const { testRenderer } = renderForm(
      <FormItem
        extra={<Text testID="custom-extra">自定义说明</Text>}
        extraText="默认说明"
        labelText="备注"
        name="remark"
      >
        <Input />
      </FormItem>,
    );

    expect(countTestId(testRenderer, 'custom-extra')).toBe(1);
    expect(json(testRenderer)).toContain('自定义说明');
    expect(json(testRenderer)).not.toContain('默认说明');
  });

  it('suppresses extra when extra is null', () => {
    const { testRenderer } = renderForm(
      <FormItem
        extra={null}
        extraText="默认说明"
        labelText="备注"
        name="remark"
      >
        <Input />
      </FormItem>,
    );

    expect(json(testRenderer)).not.toContain('默认说明');
  });

  it('renders errors through errorRender', async () => {
    const { testRenderer } = renderForm(
      <FormItem
        errorRender={message => (
          <Text testID="custom-error">{`自定义：${message}`}</Text>
        )}
        labelText="备注"
        name="remark"
        rules={requiredRule}
      >
        <Input />
      </FormItem>,
    );

    await changeInput(testRenderer, 0, '');

    expect(countTestId(testRenderer, 'custom-error')).toBe(1);
    expect(countTestId(testRenderer, 'form-item-error')).toBe(0);
    expect(json(testRenderer)).toContain('自定义：请输入备注');
  });
});
