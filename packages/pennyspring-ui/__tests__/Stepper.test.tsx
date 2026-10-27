import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Stepper } from '../src/Stepper';
import { Text } from '../src/Text';
import type { StepperProps } from '../src/Stepper';
function renderStepper(props: Partial<StepperProps> = {}) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><Stepper {...props} /></>);
  });
  return testRenderer!;
}
function pressIncrement(testRenderer: renderer.ReactTestRenderer) {
  const btn = testRenderer.root.findByProps({
    testID: 'stepper-increment'
  });
  act(() => {
    btn.props.onPress();
  });
}
function pressDecrement(testRenderer: renderer.ReactTestRenderer) {
  const btn = testRenderer.root.findByProps({
    testID: 'stepper-decrement'
  });
  act(() => {
    btn.props.onPress();
  });
}
function getDisplayValue(testRenderer: renderer.ReactTestRenderer): string {
  const input = testRenderer.root.findByProps({
    testID: 'stepper-input'
  });
  return input.props.children;
}
describe('Stepper', () => {
  test('increases uncontrolled value by step on increment press', () => {
    const onChange = jest.fn();
    const testRenderer = renderStepper({
      defaultValue: 5,
      onChange
    });
    pressIncrement(testRenderer);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(6);
  });
  test('decreases uncontrolled value by step on decrement press', () => {
    const onChange = jest.fn();
    const testRenderer = renderStepper({
      defaultValue: 5,
      onChange
    });
    pressDecrement(testRenderer);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(4);
  });
  test('fires onChange but keeps controlled value on increment', () => {
    const onChange = jest.fn();
    const testRenderer = renderStepper({
      value: 5,
      onChange
    });
    pressIncrement(testRenderer);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(6);
    expect(getDisplayValue(testRenderer)).toBe('5');
  });
  test('does not call onChange when disabled', () => {
    const onChange = jest.fn();
    const testRenderer = renderStepper({
      defaultValue: 5,
      disabled: true,
      onChange
    });
    pressIncrement(testRenderer);
    pressDecrement(testRenderer);
    expect(onChange).not.toHaveBeenCalled();
  });
  test('does not call onChange when readonly', () => {
    const onChange = jest.fn();
    const testRenderer = renderStepper({
      defaultValue: 5,
      readonly: true,
      onChange
    });
    pressIncrement(testRenderer);
    pressDecrement(testRenderer);
    expect(onChange).not.toHaveBeenCalled();
  });
  test('does not call onChange when value is at min boundary', () => {
    const onChange = jest.fn();
    const testRenderer = renderStepper({
      value: 0,
      min: 0,
      onChange
    });
    pressDecrement(testRenderer);
    expect(onChange).not.toHaveBeenCalled();
  });
  test('does not call onChange when value is at max boundary', () => {
    const onChange = jest.fn();
    const testRenderer = renderStepper({
      value: 10,
      max: 10,
      onChange
    });
    pressIncrement(testRenderer);
    expect(onChange).not.toHaveBeenCalled();
  });
  test('increments by custom step value', () => {
    const onChange = jest.fn();
    const testRenderer = renderStepper({
      defaultValue: 0,
      step: 5,
      onChange
    });
    pressIncrement(testRenderer);
    expect(onChange).toHaveBeenCalledWith(5);
  });
  test('renders unitText next to the numeric value', () => {
    const testRenderer = renderStepper({ defaultValue: 3, unitText: '期' });
    const unitText = testRenderer.root
      .findAllByType(Text)
      .find(node => node.props.children === '期');

    expect(unitText).toBeDefined();
    expect(getDisplayValue(testRenderer)).toBe('3');
  });
});
