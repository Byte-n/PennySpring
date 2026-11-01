import React from 'react';
import { TextInput } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Button } from '../src/Button';
import { Form } from '../src/Form';
import { Input } from '../src/Input';
import { Text } from '../src/Text';

interface ApiValues {
  remark: string;
}

const TypedForm = Form.infer<ApiValues>();
const { Item: FormItem, useForm } = TypedForm;

const REQUIRED_MESSAGE = '请输入备注';

const requiredRule = (value: string): string | undefined =>
  value === '' ? REQUIRED_MESSAGE : undefined;

function findText(
  testRenderer: renderer.ReactTestRenderer,
  testID: string,
): string {
  const node = testRenderer.root.findAll(
    instance => instance.props.testID === testID,
  )[0];

  return String(node.props.children);
}

function pressButton(
  testRenderer: renderer.ReactTestRenderer,
  testID: string,
): void {
  const node = testRenderer.root.findAll(
    instance =>
      instance.props.testID === testID &&
      typeof instance.props.onPress === 'function',
  )[0];

  node.props.onPress();
}

function ValueProbe() {
  const value = TypedForm.useFormState(state => state.values.remark);

  return <Text testID="probe-value">{String(value)}</Text>;
}

function SubmittingProbe() {
  const isSubmitting = TypedForm.useFormState(state => state.isSubmitting);

  return <Text testID="probe-submitting">{String(isSubmitting)}</Text>;
}

describe('Form API', () => {
  it('creates an internal form instance when form is omitted', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <TypedForm initialValues={{ remark: '初始值' }}>
          <ValueProbe />
        </TypedForm>,
      );
    });

    expect(findText(testRenderer!, 'probe-value')).toBe('初始值');
  });

  it('applies initialValues to an externally created form', () => {
    let formApi: ReturnType<typeof useForm>[0] | undefined;

    function Harness() {
      const [form] = useForm();

      formApi = form;

      return (
        <TypedForm form={form} initialValues={{ remark: '外部初始值' }}>
          <ValueProbe />
        </TypedForm>
      );
    }

    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(<Harness />);
    });

    expect(formApi!.state.values.remark).toBe('外部初始值');
    expect(findText(testRenderer!, 'probe-value')).toBe('外部初始值');
  });

  it('finishes with form values after a valid submit', async () => {
    const onFinish = jest.fn();
    let formApi: ReturnType<typeof useForm>[0] | undefined;

    function Harness() {
      const [form] = useForm();

      formApi = form;

      return (
        <TypedForm
          form={form}
          initialValues={{ remark: '' }}
          onFinish={onFinish}
        >
          <FormItem name="remark" rules={requiredRule}>
            <Input />
          </FormItem>
          <Button
            testID="submit"
            onPress={() => {
              form.handleSubmit();
            }}
          >
            提交
          </Button>
        </TypedForm>
      );
    }

    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(<Harness />);
    });

    await act(async () => {
      testRenderer!.root.findByType(TextInput).props.onChangeText('已填写');
      await formApi!.validateField('remark', 'change');
    });
    await act(async () => {
      await formApi!.handleSubmit();
    });

    expect(formApi!.state.values.remark).toBe('已填写');
    expect(onFinish).toHaveBeenCalledWith({ remark: '已填写' });
  });

  it('reports invalid fields through onFinishFailed', async () => {
    const onFinishFailed = jest.fn();
    let formApi: ReturnType<typeof useForm>[0] | undefined;

    function Harness() {
      const [form] = useForm();

      formApi = form;

      return (
        <TypedForm
          form={form}
          initialValues={{ remark: '' }}
          onFinishFailed={onFinishFailed}
        >
          <FormItem name="remark" rules={requiredRule}>
            <Input />
          </FormItem>
          <Button
            testID="submit"
            onPress={() => {
              form.handleSubmit();
            }}
          >
            提交
          </Button>
        </TypedForm>
      );
    }

    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(<Harness />);
    });

    await act(async () => {
      pressButton(testRenderer!, 'submit');
      await Promise.resolve();
    });

    expect(formApi!.state.values).toEqual({ remark: '' });
    expect(onFinishFailed).toHaveBeenCalledWith({
      values: { remark: '' },
      errorFields: [{ name: 'remark', errors: [REQUIRED_MESSAGE] }],
    });
  });

  it('exposes isSubmitting through Form.useFormState', async () => {
    let resolveFinish: (() => void) | undefined;
    const onFinish = jest.fn(
      () =>
        new Promise<void>(resolve => {
          resolveFinish = resolve;
        }),
    );

    function Harness() {
      const [form] = useForm();

      return (
        <TypedForm
          form={form}
          initialValues={{ remark: '' }}
          onFinish={onFinish}
        >
          <SubmittingProbe />
          <Button
            testID="submit"
            onPress={() => {
              form.handleSubmit();
            }}
          >
            提交
          </Button>
        </TypedForm>
      );
    }

    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(<Harness />);
    });

    await act(async () => {
      pressButton(testRenderer!, 'submit');
      await Promise.resolve();
    });

    expect(findText(testRenderer!, 'probe-submitting')).toBe('true');

    await act(async () => {
      resolveFinish?.();
      await Promise.resolve();
    });

    expect(findText(testRenderer!, 'probe-submitting')).toBe('false');
  });

  it('reports changed values through onValuesChange', async () => {
    const onValuesChange = jest.fn();
    let formApi: ReturnType<typeof useForm>[0] | undefined;

    function Harness() {
      const [form] = useForm();

      formApi = form;

      return (
        <TypedForm
          form={form}
          initialValues={{ remark: '' }}
          onValuesChange={onValuesChange}
        >
          <FormItem name="remark">
            <Input />
          </FormItem>
        </TypedForm>
      );
    }

    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(<Harness />);
    });

    await act(async () => {
      testRenderer!.root.findByType(TextInput).props.onChangeText('新值');
      await Promise.resolve();
    });

    expect(formApi!.state.values.remark).toBe('新值');
    expect(onValuesChange).toHaveBeenCalledWith(
      { remark: '新值' },
      { remark: '新值' },
    );
  });

  it('uses the latest onValuesChange after re-render', async () => {
    const firstOnValuesChange = jest.fn();
    const secondOnValuesChange = jest.fn();

    function Harness({
      onValuesChange,
    }: {
      onValuesChange: (changed: Partial<ApiValues>, values: ApiValues) => void;
    }) {
      const [form] = useForm();

      return (
        <TypedForm
          form={form}
          initialValues={{ remark: '' }}
          onValuesChange={onValuesChange}
        >
          <FormItem name="remark">
            <Input />
          </FormItem>
        </TypedForm>
      );
    }

    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <Harness onValuesChange={firstOnValuesChange} />,
      );
    });

    act(() => {
      testRenderer!.update(<Harness onValuesChange={secondOnValuesChange} />);
    });

    await act(async () => {
      testRenderer!.root.findByType(TextInput).props.onChangeText('新值');
      await Promise.resolve();
    });

    expect(firstOnValuesChange).not.toHaveBeenCalled();
    expect(secondOnValuesChange).toHaveBeenCalledWith(
      { remark: '新值' },
      { remark: '新值' },
    );
  });
});
