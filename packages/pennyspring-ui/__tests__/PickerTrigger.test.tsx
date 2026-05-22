import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { DisplayInput } from '../src/DisplayInput';
import { PickerTrigger } from '../src/Picker/PickerTrigger';

jest.mock('@react-navigation/material-top-tabs', () => ({
  createMaterialTopTabNavigator: () => ({
    Navigator: 'Navigator',
    Screen: 'Screen',
  }),
}));

it('renders readonly display input trigger with placeholder when no children', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <PickerTrigger
        placeholder="Single column"
        styles={{
          trigger: null,
        } as unknown as ReturnType<typeof import('../src/Picker/usePickerStyles').usePickerStyles>}
      />,
    );
  });

  const triggerInput = testRenderer!.root.findByType(DisplayInput);

  expect(triggerInput.props.readonly).toBe(true);
  expect(triggerInput.props.display).toBe('inline');
  expect(triggerInput.props.placeholder).toBe('Single column');
});

it('shows clear button and clears without opening picker trigger', () => {
  const onPress = jest.fn();
  const onClearPress = jest.fn();
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <PickerTrigger
        allowClear
        hasValue
        onClearPress={onClearPress}
        onPress={onPress}
        styles={{
          trigger: null,
          triggerClearButton: null,
          triggerClearButtonPressed: null,
        } as unknown as ReturnType<typeof import('../src/Picker/usePickerStyles').usePickerStyles>}
      />,
    );
  });

  act(() => {
    testRenderer!.root.findByProps({ testID: 'picker-trigger-clear-button' }).props.onPress();
  });
  act(() => {
    testRenderer!.root.findByProps({ testID: 'picker-trigger' }).props.onPress();
  });

  expect(onClearPress).toHaveBeenCalledTimes(1);
  expect(onPress).not.toHaveBeenCalled();
  expect(
    testRenderer!.root.findByProps({ testID: 'picker-trigger-clear-button' })
      .props.hitSlop,
  ).toBeGreaterThan(0);
});
