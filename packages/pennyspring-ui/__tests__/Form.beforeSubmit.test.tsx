import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Form } from '../src/Form';
import { Input } from '../src/Input';

interface BeforeSubmitValues {
  remark: string;
}

const TypedForm = Form.infer<BeforeSubmitValues>();
const { Item: FormItem, useForm } = TypedForm;

const REQUIRED_MESSAGE = '请输入备注';

const requiredRule = (value: string): string | undefined =>
  value.trim() === '' ? REQUIRED_MESSAGE : undefined;

interface HarnessProps {
  beforeSubmit?: (
    values: BeforeSubmitValues,
  ) => BeforeSubmitValues | Promise<BeforeSubmitValues>;
  initialRemark?: string;
  onFinish?: (values: BeforeSubmitValues) => void | Promise<void>;
  onFinishFailed?: () => void;
  rules?: (value: string) => string | undefined;
}

function renderHarness({
  beforeSubmit,
  initialRemark = '原文',
  onFinish,
  onFinishFailed,
  rules,
}: HarnessProps) {
  let formApi: ReturnType<typeof useForm>[0] | undefined;

  function Harness() {
    const [form] = useForm();

    formApi = form;

    return (
      <TypedForm
        beforeSubmit={beforeSubmit}
        form={form}
        initialValues={{ remark: initialRemark }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <FormItem name="remark" rules={rules}>
          <Input />
        </FormItem>
      </TypedForm>
    );
  }

  act(() => {
    renderer.create(<Harness />);
  });

  return { getForm: () => formApi! };
}

describe('Form beforeSubmit', () => {
  it('finishes with beforeSubmit values and writes them back to the form', async () => {
    const onFinish = jest.fn();
    const beforeSubmit = jest.fn(
      async (values: BeforeSubmitValues): Promise<BeforeSubmitValues> => ({
        ...values,
        remark: 'file:///Documents/persisted.jpg',
      }),
    );
    const { getForm } = renderHarness({ beforeSubmit, onFinish });

    await act(async () => {
      await getForm().handleSubmit();
    });

    expect(beforeSubmit).toHaveBeenCalledWith({ remark: '原文' });
    expect(onFinish).toHaveBeenCalledWith({
      remark: 'file:///Documents/persisted.jpg',
    });
    expect(getForm().state.values.remark).toBe(
      'file:///Documents/persisted.jpg',
    );
  });

  it('does not run beforeSubmit when validation fails', async () => {
    const beforeSubmit = jest.fn((values: BeforeSubmitValues) => values);
    const onFinish = jest.fn();
    const onFinishFailed = jest.fn();
    const { getForm } = renderHarness({
      beforeSubmit,
      initialRemark: '',
      onFinish,
      onFinishFailed,
      rules: requiredRule,
    });

    await act(async () => {
      await getForm().handleSubmit();
    });

    expect(beforeSubmit).not.toHaveBeenCalled();
    expect(onFinish).not.toHaveBeenCalled();
    expect(onFinishFailed).toHaveBeenCalled();
  });

  it('rejects handleSubmit without finishing when beforeSubmit throws', async () => {
    const onFinish = jest.fn();
    const beforeSubmit = jest.fn(async () => {
      throw new Error('图片转存失败');
    });
    const { getForm } = renderHarness({ beforeSubmit, onFinish });

    await act(async () => {
      await expect(getForm().handleSubmit()).rejects.toThrow('图片转存失败');
    });

    expect(onFinish).not.toHaveBeenCalled();
    expect(getForm().state.values.remark).toBe('原文');
    expect(getForm().state.isSubmitting).toBe(false);
  });
});
