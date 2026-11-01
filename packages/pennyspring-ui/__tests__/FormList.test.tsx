import React from 'react';
import { TextInput } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Button } from '../src/Button';
import { Form } from '../src/Form';
import { Input } from '../src/Input';
import { Text } from '../src/Text';

interface ListValues {
  items: Array<{ amount: string }>;
}

const TypedForm = Form.infer<ListValues>();
const { Item: FormItem, useForm } = TypedForm;

function renderList(initialItems: Array<{ amount: string }>) {
  let formApi: ReturnType<typeof useForm>[0] | undefined;

  function Harness() {
    const [form] = useForm();

    formApi = form;

    return (
      <TypedForm form={form} initialValues={{ items: initialItems }}>
        <TypedForm.List name="items">
          {(fields, { add, move, remove }) => (
            <>
              {fields.map(field => (
                <FormItem
                  key={field.key}
                  labelText={`金额${field.index + 1}`}
                  name={field.name('amount')}
                >
                  <Input />
                </FormItem>
              ))}
              <Text testID="list-keys">
                {fields.map(field => field.key).join(',')}
              </Text>
              <Button
                testID="add-row"
                onPress={() => {
                  add({ amount: '' });
                }}
              >
                添加
              </Button>
              <Button
                testID="remove-first"
                onPress={() => {
                  remove(0);
                }}
              >
                删除首行
              </Button>
              <Button
                testID="move-first"
                onPress={() => {
                  move(0, 1);
                }}
              >
                下移首行
              </Button>
            </>
          )}
        </TypedForm.List>
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
      instance.props.testID === testID &&
      typeof instance.props.onPress === 'function',
  )[0];

  act(() => {
    node.props.onPress();
  });
}

function inputValues(testRenderer: renderer.ReactTestRenderer): unknown[] {
  return testRenderer.root
    .findAllByType(TextInput)
    .map(instance => instance.props.value);
}

function textValue(
  testRenderer: renderer.ReactTestRenderer,
  testID: string,
): string {
  const node = testRenderer.root.findAll(
    instance => instance.props.testID === testID,
  )[0];

  return String(node.props.children);
}

describe('Form.List', () => {
  it('adds a row and updates form values', () => {
    const { testRenderer, getForm } = renderList([{ amount: 'A' }]);

    press(testRenderer, 'add-row');

    expect(getForm().state.values.items).toEqual([
      { amount: 'A' },
      { amount: '' },
    ]);
    expect(inputValues(testRenderer)).toEqual(['A', '']);
  });

  it('removes a row while keeping the remaining row key stable', () => {
    const { testRenderer, getForm } = renderList([
      { amount: 'A' },
      { amount: 'B' },
    ]);
    const keysBefore = textValue(testRenderer, 'list-keys');

    press(testRenderer, 'remove-first');

    expect(getForm().state.values.items).toEqual([{ amount: 'B' }]);
    expect(inputValues(testRenderer)).toEqual(['B']);
    expect(keysBefore).toBe('0,1');
    expect(textValue(testRenderer, 'list-keys')).toBe('1');
  });

  it('moves rows and keeps their input values aligned', () => {
    const { testRenderer, getForm } = renderList([
      { amount: 'A' },
      { amount: 'B' },
    ]);

    press(testRenderer, 'move-first');

    expect(getForm().state.values.items).toEqual([
      { amount: 'B' },
      { amount: 'A' },
    ]);
    expect(inputValues(testRenderer)).toEqual(['B', 'A']);
  });
});
