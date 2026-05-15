import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import { CalculatorInput } from '../src/CalculatorInput';
import { Text } from '../src/Text';

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

function findButton(testRenderer: renderer.ReactTestRenderer, label: string) {
  return testRenderer.root.findAll(
    node => node.props.accessibilityLabel === label,
  )[0];
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
