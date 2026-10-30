import React from 'react';
import { TextInput } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { DisplayInput } from '../src/DisplayInput';
import { Input } from '../src/Input';
import { Form, FormItemScope } from '../src/Form';
import { Text } from '../src/Text';
import type { FormItemProps } from '../src/Form';
import type { ReactNode } from 'react';

interface TestValues {
  amount: number;
  remark: string;
  name: string;
}

const TypedForm = Form.infer<TestValues>();
const { Item: FormItem, useForm } = TypedForm;

const REQUIRED_ERROR = '请输入备注';

const requiredRule = (value: string): string | undefined =>
  value.trim() === '' ? REQUIRED_ERROR : undefined;

afterEach(async () => {
  await act(async () => {
    await flushAsyncUpdates();
  });
});

interface HarnessProps {
  children: ReactNode;
  itemProps?: Partial<FormItemProps<TestValues, 'remark'>>;
  formProps?: Partial<React.ComponentProps<typeof TypedForm>>;
}

function renderHarness({ children, itemProps, formProps }: HarnessProps) {
  let formApi: ReturnType<typeof useForm> | undefined;

  function Harness() {
    const form = useForm({
      defaultValues: { amount: 0, name: '', remark: '' },
    });

    formApi = form;

    return (
      <TypedForm form={form} {...formProps}>
        <FormItem name="remark" labelText="备注" {...itemProps}>
          {children}
        </FormItem>
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

function findInput(testRenderer: renderer.ReactTestRenderer) {
  return testRenderer.root.findByType(TextInput);
}

async function flushAsyncUpdates(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 0));
}

async function changeInput(
  testRenderer: renderer.ReactTestRenderer,
  text: string,
): Promise<void> {
  await act(async () => {
    findInput(testRenderer).props.onChangeText(text);
    await flushAsyncUpdates();
  });
}

async function blurInput(
  testRenderer: renderer.ReactTestRenderer,
): Promise<void> {
  await act(async () => {
    findInput(testRenderer).props.onBlur({ nativeEvent: {} });
    await flushAsyncUpdates();
  });
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

function findProbeText(
  testRenderer: renderer.ReactTestRenderer,
  testID: string,
): string {
  const node = testRenderer.root.findAll(
    instance => instance.type === Text && instance.props.testID === testID,
  )[0];

  return node.props.children;
}

function json(testRenderer: renderer.ReactTestRenderer): string {
  return JSON.stringify(testRenderer.toJSON());
}

describe('Form labelMode', () => {
  it('renders the item label and hides the bound input label in item mode', () => {
    const { testRenderer } = renderHarness({
      children: <Input labelText="控件标签" placeholder="请输入" />,
    });

    expect(countTestId(testRenderer, 'form-item-label')).toBe(1);
    expect(countTestId(testRenderer, 'input-floating-label')).toBe(0);
    expect(json(testRenderer)).toContain('备注');
    expect(json(testRenderer)).not.toContain('控件标签');
  });

  it('delegates the label to the bound input and hides the item label in child mode', () => {
    const { testRenderer } = renderHarness({
      itemProps: { labelMode: 'child' },
      children: <Input placeholder="请输入" />,
    });

    expect(countTestId(testRenderer, 'form-item-label')).toBe(0);
    expect(countTestId(testRenderer, 'input-floating-label')).toBe(1);
    expect(json(testRenderer)).toContain('备注');
  });

  it('prefers an explicit control label over the item label in child mode', () => {
    const { testRenderer } = renderHarness({
      itemProps: { labelMode: 'child' },
      children: <Input labelText="控件标签" />,
    });

    expect(json(testRenderer)).toContain('控件标签');
    expect(json(testRenderer)).not.toContain('备注');
    expect(countTestId(testRenderer, 'form-item-label')).toBe(0);
  });

  it('renders no label at all when the item label is null', () => {
    const { testRenderer } = renderHarness({
      itemProps: { label: null, labelMode: 'child' },
      children: <Input labelText="控件标签" />,
    });

    expect(countTestId(testRenderer, 'form-item-label')).toBe(0);
    expect(countTestId(testRenderer, 'input-floating-label')).toBe(0);
    expect(json(testRenderer)).not.toContain('控件标签');
    expect(json(testRenderer)).not.toContain('备注');
  });

  it('renders the required mark only in item mode', () => {
    const itemMode = renderHarness({
      itemProps: { required: true },
      children: <Input />,
    });
    expect(countTestId(itemMode.testRenderer, 'form-item-required')).toBe(1);

    const childMode = renderHarness({
      itemProps: { required: true, labelMode: 'child' },
      children: <Input />,
    });
    expect(countTestId(childMode.testRenderer, 'form-item-required')).toBe(0);
  });

  it('hides required marks when the form disables them', () => {
    const { testRenderer } = renderHarness({
      formProps: { requiredMark: false },
      itemProps: { required: true },
      children: <Input />,
    });

    expect(countTestId(testRenderer, 'form-item-required')).toBe(0);
  });

  it('keeps an aligned label column in horizontal layout without a label', () => {
    const { testRenderer } = renderHarness({
      formProps: { layout: 'horizontal' },
      itemProps: { label: null, labelWidth: 80 },
      children: <Input />,
    });

    expect(countTestId(testRenderer, 'form-item-label-column')).toBe(1);
    expect(countTestId(testRenderer, 'form-item-content')).toBe(1);
    expect(countTestId(testRenderer, 'form-item-label')).toBe(0);
  });
});

describe('Form noStyle', () => {
  it('registers the field without label or layout but still renders errors', async () => {
    const { testRenderer, getForm } = renderHarness({
      itemProps: { noStyle: true, rules: requiredRule },
      children: <Input placeholder="请输入" />,
    });

    await changeInput(testRenderer, 'a');
    await changeInput(testRenderer, '');

    expect(getForm().state.values.remark).toBe('');
    expect(countTestId(testRenderer, 'form-item-root')).toBe(0);
    expect(countTestId(testRenderer, 'form-item-label')).toBe(0);
    expect(countTestId(testRenderer, 'form-item-error')).toBe(1);
    expect(json(testRenderer)).toContain(REQUIRED_ERROR);
    expect(countTestId(testRenderer, 'input-floating-label')).toBe(0);
  });
});

describe('Form validateTrigger', () => {
  it('shows the error after the first change by default', async () => {
    const { testRenderer } = renderHarness({
      itemProps: { rules: requiredRule },
      children: <Input />,
    });

    expect(countTestId(testRenderer, 'form-item-error')).toBe(0);

    await changeInput(testRenderer, 'a');
    expect(countTestId(testRenderer, 'form-item-error')).toBe(0);

    await changeInput(testRenderer, '');
    expect(countTestId(testRenderer, 'form-item-error')).toBe(1);
    expect(json(testRenderer)).toContain(REQUIRED_ERROR);
  });

  it('shows the error only after blur when validateTrigger is onBlur', async () => {
    const { testRenderer } = renderHarness({
      itemProps: { rules: requiredRule, validateTrigger: 'onBlur' },
      children: <Input />,
    });

    await changeInput(testRenderer, 'a');
    await changeInput(testRenderer, '');
    expect(countTestId(testRenderer, 'form-item-error')).toBe(0);

    await blurInput(testRenderer);
    expect(countTestId(testRenderer, 'form-item-error')).toBe(1);
  });

  it('shows the error only after submit when validateTrigger is onSubmit', async () => {
    const { testRenderer, getForm } = renderHarness({
      itemProps: { rules: requiredRule, validateTrigger: 'onSubmit' },
      children: <Input />,
    });

    await changeInput(testRenderer, 'a');
    await changeInput(testRenderer, '');
    expect(countTestId(testRenderer, 'form-item-error')).toBe(0);

    await act(async () => {
      await getForm().handleSubmit();
    });

    expect(countTestId(testRenderer, 'form-item-error')).toBe(1);
  });

  it('shows the error after any trigger of an array', async () => {
    const { testRenderer } = renderHarness({
      itemProps: {
        rules: requiredRule,
        validateTrigger: ['onChange', 'onBlur'],
      },
      children: <Input />,
    });

    await changeInput(testRenderer, 'a');
    await changeInput(testRenderer, '');
    expect(countTestId(testRenderer, 'form-item-error')).toBe(1);
  });

  it('renders the error only once and not inside the control', async () => {
    const { testRenderer } = renderHarness({
      itemProps: { rules: requiredRule },
      children: <Input />,
    });

    await changeInput(testRenderer, 'a');
    await changeInput(testRenderer, '');

    expect(countTestId(testRenderer, 'form-item-error')).toBe(1);
    expect(
      json(testRenderer).match(new RegExp(REQUIRED_ERROR, 'g')),
    ).toHaveLength(1);
  });
});

function FieldProbe() {
  const field = Form.Item.useFieldProps<string>({
    value: undefined,
    onChange: undefined,
    labelText: '控件标签',
  });

  return (
    <>
      <Text testID="probe-value">{String(field.value ?? '')}</Text>
      <Text testID="probe-status">{String(field.status ?? '')}</Text>
      <Text testID="probe-label">{String(field.labelText ?? '')}</Text>
      <Text testID="probe-disabled">{String(field.disabled ?? '')}</Text>
      <Text testID="probe-readonly">{String(field.readonly ?? '')}</Text>
    </>
  );
}

function probeText(
  testRenderer: renderer.ReactTestRenderer,
  testID: string,
): string {
  return findProbeText(testRenderer, testID);
}

describe('Form field prop precedence', () => {
  it('prefers explicit disabled and readonly props over form state', () => {
    const { testRenderer } = renderHarness({
      formProps: { disabled: true, readonly: true },
      children: <Input disabled={false} readonly={false} />,
    });

    expect(findInput(testRenderer).props.editable).toBe(true);
  });

  it('falls back to form disabled and readonly state', () => {
    const { testRenderer } = renderHarness({
      formProps: { disabled: true, readonly: true },
      children: <Input />,
    });

    expect(findInput(testRenderer).props.editable).toBe(false);
  });

  it('keeps an explicit status and still lets the item render the error', async () => {
    const { testRenderer } = renderHarness({
      itemProps: { rules: requiredRule, labelMode: 'child' },
      children: <Input status="warning" />,
    });

    await changeInput(testRenderer, 'a');
    await changeInput(testRenderer, '');

    expect(countTestId(testRenderer, 'form-item-error')).toBe(1);
  });

  it('passes the form field value into the control', () => {
    const { testRenderer, getForm } = renderHarness({
      children: <Input />,
    });

    act(() => {
      getForm().setFieldValue('remark', '来自表单');
    });

    expect(findInput(testRenderer).props.value).toBe('来自表单');
  });

  it('keeps an explicit value instead of the form value', () => {
    const { testRenderer, getForm } = renderHarness({
      children: <Input value="显式值" />,
    });

    act(() => {
      getForm().setFieldValue('remark', '来自表单');
    });

    expect(findInput(testRenderer).props.value).toBe('显式值');
  });

  it('runs both the form update and the explicit onChange handler', async () => {
    const onChange = jest.fn();
    const { testRenderer, getForm } = renderHarness({
      children: <Input onChange={onChange} />,
    });

    await changeInput(testRenderer, 'hello');

    expect(getForm().state.values.remark).toBe('hello');
    expect(onChange).toHaveBeenCalledWith('hello');
  });

  it('runs both the form blur and the explicit onBlur handler', async () => {
    const onBlur = jest.fn();
    const { testRenderer } = renderHarness({
      children: <Input onBlur={onBlur} />,
    });

    await blurInput(testRenderer);

    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});

describe('DisplayInput in Form', () => {
  it('binds the item label while the item renders validation errors', async () => {
    const { testRenderer, getForm } = renderHarness({
      itemProps: {
        rules: requiredRule,
        labelMode: 'child',
        validateTrigger: 'onSubmit',
      },
      children: <DisplayInput valueText="展示值" />,
    });

    expect(countTestId(testRenderer, 'display-input-floating-label')).toBe(1);
    expect(json(testRenderer)).toContain('备注');

    await act(async () => {
      await getForm().handleSubmit();
    });

    expect(countTestId(testRenderer, 'form-item-error')).toBe(1);
    expect(
      json(testRenderer).match(new RegExp(REQUIRED_ERROR, 'g')),
    ).toHaveLength(1);
  });

  it('keeps standalone behavior outside a Form.Item', () => {
    let testRenderer: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(
        <DisplayInput labelText="独立标签" valueText="展示值" />,
      );
    });

    expect(json(testRenderer!)).toContain('独立标签');
  });
});

describe('FormItemScope', () => {
  it('isolates nested controls from the surrounding form item', () => {
    const { testRenderer } = renderHarness({
      children: (
        <>
          <FieldProbe />
          <FormItemScope>
            <Input labelText="独立标签" />
          </FormItemScope>
        </>
      ),
    });

    expect(probeText(testRenderer, 'probe-label')).toBe('');
    expect(json(testRenderer)).toContain('独立标签');
    expect(countTestId(testRenderer, 'input-floating-label')).toBe(1);
  });
});
