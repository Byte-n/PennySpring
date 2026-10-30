import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { CalculatorInput } from '../src/CalculatorInput';
import { Checkbox } from '../src/Checkbox';
import { Form } from '../src/Form';
import { ListPicker } from '../src/ListPicker';
import { Radio } from '../src/Radio';
import { Segmented } from '../src/Segmented';
import { Stepper } from '../src/Stepper';
import { Switch } from '../src/Switch';
import type { ReactNode } from 'react';

interface ControlValues {
  expression: string;
  flag: boolean;
  mode: string;
  options: string[];
  pick: string;
  choice: string;
  count: number;
}

const TypedForm = Form.infer<ControlValues>();
const { Item: FormItem, useForm } = TypedForm;

const PICK_ERROR = '请选择';

function renderForm(
  children: ReactNode,
  formProps: Partial<React.ComponentProps<typeof TypedForm>> = {},
) {
  let formApi: ReturnType<typeof useForm>[0] | undefined;

  function Harness() {
    const [form] = useForm();

    formApi = form;

    return (
      <TypedForm
        form={form}
        initialValues={{
          expression: '',
          flag: false,
          mode: 'a',
          options: [],
          pick: '',
          choice: '',
          count: 0,
        }}
        {...formProps}
      >
        {children}
      </TypedForm>
    );
  }

  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<Harness />);
  });

  return { testRenderer: testRenderer!, getForm: () => formApi! };
}

function press(testRenderer: renderer.ReactTestRenderer, testID: string): void {
  const node = testRenderer.root.findAll(
    instance =>
      instance.props.testID === testID && instance.props.onPress !== undefined,
  )[0];
  act(() => {
    node.props.onPress();
  });
}

describe('non-text controls in Form', () => {
  it('binds Switch to the form field', () => {
    const { testRenderer, getForm } = renderForm(
      <FormItem name="flag" labelText="开关">
        <Switch />
      </FormItem>,
    );

    press(testRenderer, 'switch');

    expect(getForm().state.values.flag).toBe(true);
  });

  it('disables Switch when the form is disabled', () => {
    const { testRenderer, getForm } = renderForm(
      <FormItem name="flag">
        <Switch />
      </FormItem>,
      { disabled: true },
    );
    const switchNode = testRenderer.root.findAll(
      instance =>
        instance.props.testID === 'switch' &&
        instance.props.onPress !== undefined,
    )[0];

    expect(switchNode.props.disabled).toBe(true);

    act(() => {
      switchNode.props.onPress();
    });

    expect(getForm().state.values.flag).toBe(false);
  });

  it('binds a single Checkbox to the form field', () => {
    const { testRenderer, getForm } = renderForm(
      <FormItem name="flag">
        <Checkbox>同意</Checkbox>
      </FormItem>,
    );

    press(testRenderer, 'checkbox-control');

    expect(getForm().state.values.flag).toBe(true);
  });

  it('binds Checkbox.Group to the form field', () => {
    const { testRenderer, getForm } = renderForm(
      <FormItem name="options">
        <Checkbox.Group
          options={[
            { labelText: 'A', value: 'a' },
            { labelText: 'B', value: 'b' },
          ]}
        />
      </FormItem>,
    );

    press(testRenderer, 'checkbox-group-option-a');

    expect(getForm().state.values.options).toEqual(['a']);
  });

  it('binds Radio.Group to the form field', () => {
    const { testRenderer, getForm } = renderForm(
      <FormItem name="choice">
        <Radio.Group
          options={[
            { labelText: 'A', value: 'a' },
            { labelText: 'B', value: 'b' },
          ]}
        />
      </FormItem>,
    );

    press(testRenderer, 'radio-group-option-b');

    expect(getForm().state.values.choice).toBe('b');
  });

  it('binds Stepper to the form field', () => {
    const { testRenderer, getForm } = renderForm(
      <FormItem name="count">
        <Stepper />
      </FormItem>,
    );

    press(testRenderer, 'stepper-increment');

    expect(getForm().state.values.count).toBe(1);
  });

  it('binds Segmented to the form field', () => {
    const { testRenderer, getForm } = renderForm(
      <FormItem name="mode">
        <Segmented
          options={[
            { labelText: 'A', value: 'a' },
            { labelText: 'B', value: 'b' },
          ]}
        />
      </FormItem>,
    );

    press(testRenderer, 'segmented-item-b');

    expect(getForm().state.values.mode).toBe('b');
  });

  it('binds CalculatorInput expression to the form field', () => {
    const { testRenderer, getForm } = renderForm(
      <FormItem name="expression">
        <CalculatorInput />
      </FormItem>,
    );

    press(testRenderer, 'calc-key-1');

    expect(getForm().state.values.expression).toBe('1');
  });
});

describe('picker controls in Form', () => {
  const options = [
    { labelText: '选项A', value: 'a' },
    { labelText: '选项B', value: 'b' },
  ];

  it('binds ListPicker value and item label', () => {
    const { testRenderer, getForm } = renderForm(
      <FormItem name="pick" labelText="选择">
        <ListPicker options={options} />
      </FormItem>,
    );

    act(() => {
      getForm().setFieldValue('pick', 'a');
    });

    expect(JSON.stringify(testRenderer.toJSON())).toContain('选项A');
    expect(
      testRenderer.root.findAll(
        instance => instance.props.testID === 'form-item-label',
      ).length,
    ).toBeGreaterThan(0);
    expect(
      testRenderer.root.findAll(
        instance => instance.props.testID === 'display-input-floating-label',
      ),
    ).toHaveLength(0);
  });

  it('delegates the picker label in child mode', () => {
    const { testRenderer } = renderForm(
      <FormItem name="pick" labelText="选择" labelMode="child">
        <ListPicker options={options} />
      </FormItem>,
    );

    expect(
      testRenderer.root.findAll(
        instance => instance.props.testID === 'form-item-label',
      ),
    ).toHaveLength(0);
    expect(
      testRenderer.root.findAll(
        instance => instance.props.testID === 'display-input-floating-label',
      ).length,
    ).toBeGreaterThan(0);
  });

  it('renders the list picker error only once in the item', async () => {
    const { testRenderer, getForm } = renderForm(
      <FormItem
        name="pick"
        labelText="选择"
        rules={value => (value === '' ? PICK_ERROR : undefined)}
        validateTrigger="onSubmit"
      >
        <ListPicker options={options} />
      </FormItem>,
    );

    await act(async () => {
      await getForm().handleSubmit();
    });

    expect(
      testRenderer.root.findAll(
        instance => instance.props.testID === 'form-item-error',
      ).length,
    ).toBeGreaterThan(0);
    expect(
      JSON.stringify(testRenderer.toJSON()).match(new RegExp(PICK_ERROR, 'g')),
    ).toHaveLength(1);
  });
});
