import React from 'react';
import { TextInput } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Form } from '../src/Form';
import { Input } from '../src/Input';

interface AsyncValues {
  remark: string;
}

const TypedForm = Form.infer<AsyncValues>();
const { Item: FormItem, useForm } = TypedForm;

function renderForm(rule: (value: string) => Promise<string | undefined>) {
  let formApi: ReturnType<typeof useForm>[0] | undefined;

  function Harness() {
    const [form] = useForm();

    formApi = form;

    return (
      <TypedForm form={form} initialValues={{ remark: '' }}>
        <FormItem name="remark" rules={rule} asyncDebounceMs={300}>
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

function changeInput(
  testRenderer: renderer.ReactTestRenderer,
  value: string,
): void {
  act(() => {
    testRenderer.root.findByType(TextInput).props.onChangeText(value);
  });
}

describe('Form async debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('delays async rules until the debounce window passes', async () => {
    const rule = jest.fn(async (_value: string) => undefined);
    const { testRenderer } = renderForm(rule);

    changeInput(testRenderer, 'a');
    changeInput(testRenderer, 'ab');

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(rule).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(299);
      await Promise.resolve();
    });

    expect(rule).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(1);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(rule).toHaveBeenCalledTimes(1);
  });
});
