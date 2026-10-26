import React from 'react';
import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { DisplayInput } from '../src/DisplayInput';
import { PickerTrigger } from '../src/_internal/PickerTrigger';

function renderTrigger(
  props: React.ComponentProps<typeof PickerTrigger>,
): renderer.ReactTestRenderer {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(<PickerTrigger {...props} />);
  });

  return testRenderer!;
}

it('renders interactive display input trigger with label when no children', () => {
  const testRenderer = renderTrigger({ label: 'Single column' });
  const triggerInput = testRenderer.root.findByType(DisplayInput);

  expect(triggerInput.props.readonly).toBeUndefined();
  expect(triggerInput.props.label).toBe('Single column');
});

it('passes size to display input', () => {
  const testRenderer = renderTrigger({ size: 'small' });
  const triggerInput = testRenderer.root.findByType(DisplayInput);

  expect(triggerInput.props.size).toBe('small');
});

it('shows clear button and clears without opening picker trigger', () => {
  const onPress = jest.fn();
  const onClearPress = jest.fn();
  const testRenderer = renderTrigger({
    allowClear: true,
    hasValue: true,
    onClearPress,
    onPress,
  });

  act(() => {
    testRenderer.root.findByProps({ testID: 'picker-trigger-clear-button' }).props.onPress();
  });
  act(() => {
    testRenderer.root.findByType(DisplayInput).props.onPress();
  });

  expect(onClearPress).toHaveBeenCalledTimes(1);
  expect(onPress).not.toHaveBeenCalled();
  expect(
    testRenderer.root.findByProps({ testID: 'picker-trigger-clear-button' })
      .props.hitSlop,
  ).toBeGreaterThan(0);
});

it('resets the clear guard so the next trigger press still opens', () => {
  jest.useFakeTimers();
  const onPress = jest.fn();
  const testRenderer = renderTrigger({
    allowClear: true,
    hasValue: true,
    onClearPress: jest.fn(),
    onPress,
  });

  act(() => {
    testRenderer.root.findByProps({ testID: 'picker-trigger-clear-button' }).props.onPress();
  });
  act(() => {
    jest.advanceTimersByTime(1);
  });
  act(() => {
    testRenderer.root.findByType(DisplayInput).props.onPress();
  });

  expect(onPress).toHaveBeenCalledTimes(1);
  jest.useRealTimers();
});

it('hides clear button when readonly, disabled or without value', () => {
  const readonlyRenderer = renderTrigger({
    allowClear: true,
    hasValue: true,
    readonly: true,
  });
  const disabledRenderer = renderTrigger({
    allowClear: true,
    disabled: true,
    hasValue: true,
  });
  const emptyRenderer = renderTrigger({ allowClear: true });

  expect(
    readonlyRenderer.root.findAllByProps({ testID: 'picker-trigger-clear-button' }),
  ).toHaveLength(0);
  expect(
    disabledRenderer.root.findAllByProps({ testID: 'picker-trigger-clear-button' }),
  ).toHaveLength(0);
  expect(
    emptyRenderer.root.findAllByProps({ testID: 'picker-trigger-clear-button' }),
  ).toHaveLength(0);
});

it('prefers external suffix over the clear button', () => {
  const externalSuffix = <Text>external suffix</Text>;
  const testRenderer = renderTrigger({
    allowClear: true,
    displayInputProps: { suffix: externalSuffix },
    hasValue: true,
  });
  const triggerInput = testRenderer.root.findByType(DisplayInput);

  expect(triggerInput.props.suffix).toBe(externalSuffix);
  expect(
    testRenderer.root.findAllByProps({ testID: 'picker-trigger-clear-button' }),
  ).toHaveLength(0);
});

it('replaces the component suffix with the clear button when clearable', () => {
  const componentSuffix = <Text>caret</Text>;
  const clearableRenderer = renderTrigger({
    allowClear: true,
    hasValue: true,
    suffix: componentSuffix,
  });
  const plainRenderer = renderTrigger({ suffix: componentSuffix });

  expect(
    clearableRenderer.root.findAllByProps({ testID: 'picker-trigger-clear-button' }).length,
  ).toBeGreaterThan(0);
  expect(
    plainRenderer.root.findByType(DisplayInput).props.suffix,
  ).toBe(componentSuffix);
});
