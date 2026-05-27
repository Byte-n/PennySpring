import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import { CalculatorInput } from '../src/CalculatorInput';
import { Text } from '../src/Text';
import { Popup } from '../src/Popup';

function renderCalculatorInput(
  props: Partial<React.ComponentProps<typeof CalculatorInput>> = {},
) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(<CalculatorInput {...props} />);
  });

  return testRenderer!;
}

function findDisplay(testRenderer: renderer.ReactTestRenderer) {
  return testRenderer.root.findByType(TextInput);
}

const KEY_MAP: Record<string, string> = {
  '数字 0': 'calc-key-0',
  '数字 1': 'calc-key-1',
  '数字 2': 'calc-key-2',
  '数字 3': 'calc-key-3',
  '数字 4': 'calc-key-4',
  '数字 5': 'calc-key-5',
  '数字 6': 'calc-key-6',
  '数字 7': 'calc-key-7',
  '数字 8': 'calc-key-8',
  '数字 9': 'calc-key-9',
  '加': 'calc-key-+',
  '减': 'calc-key--',
  '乘': 'calc-key-×',
  '除': 'calc-key-/',
  '退格': 'calc-key-backspace',
  '清空': 'calc-key-C',
  '确认': 'calc-key-ok',
  '括号': 'calc-key-()',
  '小数点': 'calc-key-.',
};

function findButton(testRenderer: renderer.ReactTestRenderer, label: string) {
  const testID = KEY_MAP[label];
  return testRenderer.root.findByProps({ testID });
}

function findResultText(testRenderer: renderer.ReactTestRenderer) {
  return testRenderer.root.findAllByType(Text)[0];
}

function press(testRenderer: renderer.ReactTestRenderer, label: string) {
  act(() => {
    findButton(testRenderer, label).props.onPress();
  });
}

describe('CalculatorInput', () => {
  it('builds an expression from keypad presses and shows the evaluated result', () => {
    const onChange = jest.fn();
    const testRenderer = renderCalculatorInput({ onChange });

    press(testRenderer, '数字 1');
    press(testRenderer, '加');
    press(testRenderer, '数字 2');
    press(testRenderer, '乘');
    press(testRenderer, '数字 3');

    expect(findDisplay(testRenderer).props.value).toBe('1+2×3');
    expect(JSON.stringify(testRenderer.toJSON())).toContain('7');
    expect(onChange).toHaveBeenLastCalledWith('1+2×3');
  });

  it('shows an empty result when the current expression cannot be evaluated', () => {
    const testRenderer = renderCalculatorInput();

    press(testRenderer, '数字 1');
    press(testRenderer, '加');

    expect(findDisplay(testRenderer).props.value).toBe('1+');
    expect(findResultText(testRenderer).props.children).toBe('');
  });

  it('clears and deletes expression input', () => {
    const testRenderer = renderCalculatorInput({ defaultValue: '12+3' });

    press(testRenderer, '退格');
    expect(findDisplay(testRenderer).props.value).toBe('12+');

    press(testRenderer, '清空');
    expect(findDisplay(testRenderer).props.value).toBe('');
  });

  it('keeps controlled value from props while notifying expression changes', () => {
    const onChange = jest.fn();
    const testRenderer = renderCalculatorInput({
      onChange,
      value: '8',
    });

    press(testRenderer, '数字 9');

    expect(findDisplay(testRenderer).props.value).toBe('8');
    expect(onChange).toHaveBeenCalledWith('89');
  });

  it('confirms only when the expression has a result', () => {
    const onOk = jest.fn();
    const testRenderer = renderCalculatorInput({
      defaultValue: '6/2',
      onOk,
    });

    press(testRenderer, '确认');
    expect(onOk).toHaveBeenCalledWith({
      expression: '6/2',
      result: 3,
    });

    const invalidRenderer = renderCalculatorInput({
      defaultValue: '6/',
      onOk,
    });

    press(invalidRenderer, '确认');
    expect(onOk).toHaveBeenCalledTimes(1);
  });

  it('evaluates expressions with parentheses correctly', () => {
    const onOk = jest.fn();
    const testRenderer = renderCalculatorInput({
      defaultValue: '(1+2)×3',
      onOk,
    });

    expect(JSON.stringify(testRenderer.toJSON())).toContain('9');

    press(testRenderer, '确认');
    expect(onOk).toHaveBeenCalledWith({
      expression: '(1+2)×3',
      result: 9,
    });
  });

  it('inserts open paren at start or after operator, close paren after digit with unmatched open', () => {
    const testRenderer = renderCalculatorInput();

    press(testRenderer, '括号');
    expect(findDisplay(testRenderer).props.value).toBe('(');

    press(testRenderer, '数字 1');
    press(testRenderer, '加');
    press(testRenderer, '括号');
    expect(findDisplay(testRenderer).props.value).toBe('(1+(');

    press(testRenderer, '数字 2');
    press(testRenderer, '括号');
    expect(findDisplay(testRenderer).props.value).toBe('(1+(2)');

    press(testRenderer, '括号');
    expect(findDisplay(testRenderer).props.value).toBe('(1+(2))');
  });

  it('does not edit or confirm when disabled or readonly', () => {
    const onChange = jest.fn();
    const onOk = jest.fn();
    const disabledRenderer = renderCalculatorInput({
      defaultValue: '1',
      disabled: true,
      onChange,
      onOk,
    });
    const readonlyRenderer = renderCalculatorInput({
      defaultValue: '2',
      onChange,
      onOk,
      readonly: true,
    });

    press(disabledRenderer, '数字 3');
    press(readonlyRenderer, '确认');

    expect(findDisplay(disabledRenderer).props.value).toBe('1');
    expect(onChange).not.toHaveBeenCalled();
    expect(onOk).not.toHaveBeenCalled();
  });
});

describe('CalculatorInput.Popup', () => {
  it('renders CalculatorInput inside a Popup', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <CalculatorInput.Popup open defaultValue="1+2" />,
      );
    });

    const popup = testRenderer!.root.findByType(Popup);
    expect(popup.props.open).toBe(true);
    expect(testRenderer!.root.findByType(TextInput).props.value).toBe('1+2');
  });

  it('calls onOk with result and closes when = is pressed', () => {
    const onOk = jest.fn();
    const onOpenChange = jest.fn();
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <CalculatorInput.Popup
          defaultOpen
          defaultValue="3×4"
          onOk={onOk}
          onOpenChange={onOpenChange}
        />,
      );
    });

    act(() => {
      findButton(testRenderer!, '确认').props.onPress();
    });

    expect(onOk).toHaveBeenCalledWith({ expression: '3×4', result: 12 });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onCancel when popup mask is pressed', () => {
    const onCancel = jest.fn();
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <CalculatorInput.Popup open onCancel={onCancel} />,
      );
    });

    const popup = testRenderer!.root.findByType(Popup);

    act(() => {
      popup.props.onCancel({ reason: 'mask' });
    });

    expect(onCancel).toHaveBeenCalledWith({ reason: 'mask' });
  });

  it('calls onCancel only once when Popup cancel flow triggers onCancel and onOpenChange', () => {
    const onCancel = jest.fn();
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <CalculatorInput.Popup open onCancel={onCancel} />,
      );
    });

    const popup = testRenderer!.root.findByType(Popup);

    act(() => {
      popup.props.onCancel({ reason: 'mask' });
      popup.props.onOpenChange(false, { reason: 'mask' });
    });

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledWith({ reason: 'mask' });
  });
});
