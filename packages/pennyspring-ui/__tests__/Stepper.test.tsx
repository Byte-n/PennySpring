import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Stepper } from '../src/Stepper';
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
  // --- Issue #3: Text size/color via props ---
  test('button Text uses size prop matching Stepper size', () => {
    const testRenderer = renderStepper({ size: 'small' });
    const decrementBtn = testRenderer.root.findByProps({ testID: 'stepper-decrement' });
    const textChild = decrementBtn.props.children;
    // Text should receive size='sm' prop for small Stepper
    expect(textChild.props.size).toBe('sm');
  });

  test('input Text uses size prop matching Stepper size', () => {
    const testRenderer = renderStepper({ size: 'large' });
    const input = testRenderer.root.findByProps({ testID: 'stepper-input' });
    expect(input.props.size).toBe('lg');
  });

  test('button Text uses color="disabled" when at min boundary', () => {
    const testRenderer = renderStepper({ value: 0, min: 0 });
    const decrementBtn = testRenderer.root.findByProps({ testID: 'stepper-decrement' });
    const textChild = decrementBtn.props.children;
    expect(textChild.props.color).toBe('disabled');
  });

  test('input Text uses color="disabled" when disabled', () => {
    const testRenderer = renderStepper({ disabled: true });
    const input = testRenderer.root.findByProps({ testID: 'stepper-input' });
    expect(input.props.color).toBe('disabled');
  });

  // --- Issue #2: Row layout ---
  test('root container uses Row layout with flexDirection row', () => {
    const testRenderer = renderStepper();
    const root = testRenderer.root;
    // The first rendered element (root View) should have flexDirection: 'row'
    const rootView = root.children[0] as renderer.ReactTestInstance;
    const flatStyle = Array.isArray(rootView.props.style)
      ? Object.assign({}, ...rootView.props.style.filter(Boolean))
      : rootView.props.style ?? {};
    expect(flatStyle.flexDirection).toBe('row');
    expect(flatStyle.alignItems).toBe('center');
  });

  // --- Issue #4: Token-driven hit slop ---
  test('buttons use token-driven hitSlop instead of hardcoded 8', () => {
    const testRenderer = renderStepper();
    const decrementBtn = testRenderer.root.findByProps({ testID: 'stepper-decrement' });
    const incrementBtn = testRenderer.root.findByProps({ testID: 'stepper-increment' });
    // hitSlop should not be the hardcoded value 8
    expect(decrementBtn.props.hitSlop).not.toBe(8);
    expect(incrementBtn.props.hitSlop).not.toBe(8);
    // hitSlop should be a positive number (token-derived)
    expect(typeof decrementBtn.props.hitSlop).toBe('number');
    expect(decrementBtn.props.hitSlop).toBeGreaterThan(0);
  });

  // --- Existing tests ---
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
});
