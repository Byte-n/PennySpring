import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { PickerTrigger } from '../src/Picker/PickerTrigger';

jest.mock('@react-navigation/material-top-tabs', () => ({
  createMaterialTopTabNavigator: () => ({
    Navigator: 'Navigator',
    Screen: 'Screen',
  }),
}));

it('renders readonly input trigger with placeholder when no children', () => {
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

  const triggerInput = testRenderer!.root.findByProps({
    testID: 'picker-trigger-input',
  });

  expect(triggerInput.props.readonly).toBe(true);
  expect(triggerInput.props.placeholder).toBe('Single column');
});
