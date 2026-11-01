import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import { CalculatorInput } from '../src/CalculatorInput';
import { Column } from '../src/Column';
import { Icon } from '../src/Icon';
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
  加: 'calc-key-+',
  减: 'calc-key--',
  乘: 'calc-key-×',
  除: 'calc-key-/',
  退格: 'calc-key-backspace',
  清空: 'calc-key-C',
  确认: 'calc-key-ok',
  括号: 'calc-key-()',
  小数点: 'calc-key-.',
};

function findButton(testRenderer: renderer.ReactTestRenderer, label: string) {
  const testID = KEY_MAP[label];
  return testRenderer.root.findByProps({ testID });
}

function findResultText(testRenderer: renderer.ReactTestRenderer) {
  return testRenderer.root.findByProps({ testID: 'calc-result' });
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

  it('shows a dash before any expression is entered', () => {
    const testRenderer = renderCalculatorInput();

    expect(findResultText(testRenderer).props.children).toBe('—');
  });

  it('shows a dash when the current expression cannot be evaluated', () => {
    const testRenderer = renderCalculatorInput();

    press(testRenderer, '数字 1');
    press(testRenderer, '加');

    expect(findDisplay(testRenderer).props.value).toBe('1+');
    expect(findResultText(testRenderer).props.children).toBe('—');
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

describe('CalculatorInput styling compliance', () => {
  it('passes semantic color key to backspace Icon instead of resolved color value', () => {
    const testRenderer = renderCalculatorInput();
    const backspaceKey = testRenderer.root.findByProps({
      testID: 'calc-key-backspace',
    });
    const icon = backspaceKey.findByType(Icon);

    expect(icon.props.color).toBe('secondary');
  });

  it('passes disabled semantic color to backspace Icon when disabled', () => {
    const testRenderer = renderCalculatorInput({ disabled: true });
    const backspaceKey = testRenderer.root.findByProps({
      testID: 'calc-key-backspace',
    });
    const icon = backspaceKey.findByType(Icon);

    expect(icon.props.color).toBe('disabled');
  });

  it('uses TextProps for key text size, weight, and color', () => {
    const testRenderer = renderCalculatorInput();
    const sevenKey = testRenderer.root.findByProps({
      testID: 'calc-key-7',
    });
    const text = sevenKey.findByType(Text);

    expect(text.props.size).toBe('xl');
    expect(text.props.weight).toBe('medium');
    expect(text.props.color).toBe('default');
  });

  it('uses TextProps for function and operator key text colors', () => {
    const testRenderer = renderCalculatorInput();
    const clearText = testRenderer.root
      .findByProps({ testID: 'calc-key-C' })
      .findByType(Text);
    const plusText = testRenderer.root
      .findByProps({ testID: 'calc-key-+' })
      .findByType(Text);

    expect(clearText.props.color).toBe('secondary');
    expect(plusText.props.color).toBe('default');
  });

  it('uses TextProps for ok key text size, weight, and color', () => {
    const testRenderer = renderCalculatorInput({ defaultValue: '1+2' });
    const okKey = testRenderer.root.findByProps({ testID: 'calc-key-ok' });
    const text = okKey.findByType(Text);

    expect(text.props.size).toBe('h4');
    expect(text.props.weight).toBe('semibold');
    expect(text.props.color).toBe('lightSolid');
  });

  it('uses TextProps for result text size and color', () => {
    const testRenderer = renderCalculatorInput({ defaultValue: '1+2' });
    const resultText = findResultText(testRenderer);

    expect(resultText.props.size).toBe('h2');
    expect(resultText.props.color).toBe('default');
  });

  it('uses flex layout for left keypad area instead of hardcoded percentage width', () => {
    const testRenderer = renderCalculatorInput();
    const leftPadColumn = testRenderer.root
      .findAllByType(Column)
      .find(node => node.props.style?.width === '75%');

    expect(leftPadColumn).toBeUndefined();
  });

  it('uses object hitSlop for keypad keys instead of numeric literal', () => {
    const testRenderer = renderCalculatorInput();
    const key = testRenderer.root.findByProps({ testID: 'calc-key-7' });

    expect(typeof key.props.hitSlop).toBe('object');
    expect(key.props.hitSlop).toMatchObject({
      top: expect.any(Number),
      right: expect.any(Number),
      bottom: expect.any(Number),
      left: expect.any(Number),
    });
  });
});
