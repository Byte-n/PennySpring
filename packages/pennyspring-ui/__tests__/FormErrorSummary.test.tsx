import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Form } from '../src/Form';
import { Input } from '../src/Input';
import { Text } from '../src/Text';

interface SummaryValues {
  remark: string;
}

const TypedForm = Form.infer<SummaryValues>();
const { Item: FormItem, useForm } = TypedForm;

function renderSummary() {
  let formApi: ReturnType<typeof useForm>[0] | undefined;

  function Harness() {
    const [form] = useForm();

    formApi = form;

    return (
      <TypedForm form={form} initialValues={{ remark: '' }}>
        <TypedForm.ErrorSummary title="请检查以下问题" />
        <FormItem name="remark" labelText="备注">
          <Input />
        </FormItem>
      </TypedForm>
    );
  }

  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(<Harness />);
  });

  return { testRenderer: testRenderer!, getForm: () => formApi! };
}

function countTestId(
  testRenderer: renderer.ReactTestRenderer,
  testID: string,
): number {
  return testRenderer.root.findAll(
    instance => instance.type === Text && instance.props.testID === testID,
  ).length;
}

function hasTestId(
  testRenderer: renderer.ReactTestRenderer,
  testID: string,
): boolean {
  return (
    testRenderer.root.findAll(instance => instance.props.testID === testID)
      .length > 0
  );
}

describe('Form.ErrorSummary', () => {
  it('renders form-level errors with a title', () => {
    const { testRenderer, getForm } = renderSummary();

    act(() => {
      getForm().setErrorMap({
        onSubmit: { form: '保存失败', fields: {} },
      });
    });

    expect(hasTestId(testRenderer, 'form-error-summary')).toBe(true);
    expect(countTestId(testRenderer, 'form-error-summary-item')).toBe(1);
    expect(JSON.stringify(testRenderer.toJSON())).toContain('请检查以下问题');
    expect(JSON.stringify(testRenderer.toJSON())).toContain('保存失败');
  });

  it('skips errors that belong to a registered field', () => {
    const { testRenderer, getForm } = renderSummary();

    act(() => {
      getForm().setErrorMap({
        onSubmit: {
          '': ['根级错误'],
          remark: ['字段错误'],
        },
      } as never);
    });

    const json = JSON.stringify(testRenderer.toJSON());

    expect(json).toContain('根级错误');
    expect(json).not.toContain('字段错误');
    expect(countTestId(testRenderer, 'form-error-summary-item')).toBe(1);
  });

  it('renders nothing when there is no form-level error', () => {
    const { testRenderer } = renderSummary();

    expect(hasTestId(testRenderer, 'form-error-summary')).toBe(false);
  });
});
