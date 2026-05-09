import React from 'react';
import { Text as RNText } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { Checkbox } from '../src/Checkbox';
import type { CheckboxGroupProps, CheckboxProps } from '../src/Checkbox';

function renderCheckbox(props: Partial<CheckboxProps> = {}) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <ThemeProvider>
        <Checkbox {...props}>Remember budget</Checkbox>
      </ThemeProvider>,
    );
  });

  return testRenderer!;
}

function renderCheckboxGroup(props: Partial<CheckboxGroupProps> = {}) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <ThemeProvider>
        <Checkbox.Group
          options={[
            { value: 'food', label: 'Food' },
            { value: 'rent', label: 'Rent' },
            { value: 2026, label: <RNText>Year</RNText> },
          ]}
          {...props}
        />
      </ThemeProvider>,
    );
  });

  return testRenderer!;
}

function pressCheckbox(testRenderer: renderer.ReactTestRenderer) {
  testRenderer.root.findByProps({ testID: 'checkbox-control' });
  const pressable = findPressableTargets(testRenderer)[0];

  act(() => {
    pressable.props.onPress();
  });

  return pressable;
}

function pressGroupOption(
  testRenderer: renderer.ReactTestRenderer,
  value: string | number,
) {
  testRenderer.root.findByProps({
    testID: `checkbox-group-option-${String(value)}`,
  });
  const optionValues = ['food', 'rent', 2026];
  const pressable = findPressableTargets(testRenderer)[optionValues.indexOf(value)];

  act(() => {
    pressable.props.onPress();
  });

  return pressable;
}

function textContent(testRenderer: renderer.ReactTestRenderer) {
  return JSON.stringify(testRenderer.toJSON());
}

function findPressableTargets(
  testRenderer: renderer.ReactTestRenderer,
): renderer.ReactTestInstance[] {
  return testRenderer.root.findAll(
    node => typeof node.props.onPress === 'function',
  );
}

describe('Checkbox', () => {
  it('toggles uncontrolled value and reports the next boolean', () => {
    const onChange = jest.fn();
    const testRenderer = renderCheckbox({
      defaultValue: false,
      onChange,
    });

    pressCheckbox(testRenderer);

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('keeps controlled value derived from props while reporting changes', () => {
    const onChange = jest.fn();
    const testRenderer = renderCheckbox({
      value: false,
      onChange,
    });

    pressCheckbox(testRenderer);
    const marks = testRenderer.root.findAllByProps({ testID: 'checkbox-mark' });

    expect(onChange).toHaveBeenCalledWith(true);
    expect(marks).toHaveLength(0);
  });

  it('does not toggle when disabled or readonly', () => {
    const onChange = jest.fn();
    const disabledRenderer = renderCheckbox({
      disabled: true,
      onChange,
    });
    const readonlyRenderer = renderCheckbox({
      readonly: true,
      onChange,
    });

    const disabledControl = pressCheckbox(disabledRenderer);
    pressCheckbox(readonlyRenderer);

    expect(onChange).not.toHaveBeenCalled();
    expect(disabledControl.props.disabled).toBe(true);
  });

  it('treats indeterminate as visual only when pressed', () => {
    const onChange = jest.fn();
    const testRenderer = renderCheckbox({
      defaultValue: false,
      indeterminate: true,
      onChange,
    });

    pressCheckbox(testRenderer);

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('uses button display type with the same toggle behavior', () => {
    const onChange = jest.fn();
    const testRenderer = renderCheckbox({
      defaultValue: true,
      displayType: 'button',
      onChange,
    });

    pressCheckbox(testRenderer);

    expect(onChange).toHaveBeenCalledWith(false);
  });
});

describe('Checkbox.Group', () => {
  it('renders data-driven option labels', () => {
    const testRenderer = renderCheckboxGroup();
    const content = textContent(testRenderer);

    expect(content).toContain('Food');
    expect(content).toContain('Rent');
    expect(content).toContain('Year');
  });

  it('adds and removes option values immutably', () => {
    const initialValue = ['food'];
    const onChange = jest.fn();
    const testRenderer = renderCheckboxGroup({
      defaultValue: initialValue,
      onChange,
    });

    pressGroupOption(testRenderer, 'rent');
    pressGroupOption(testRenderer, 'food');

    expect(onChange).toHaveBeenNthCalledWith(1, ['food', 'rent']);
    expect(onChange).toHaveBeenNthCalledWith(2, ['rent']);
    expect(initialValue).toEqual(['food']);
  });

  it('keeps controlled group value derived from props while reporting changes', () => {
    const onChange = jest.fn();
    const testRenderer = renderCheckboxGroup({
      value: ['food'],
      onChange,
    });

    pressGroupOption(testRenderer, 'rent');
    const foodMarks = testRenderer.root.findAllByProps({
      testID: 'checkbox-group-option-food-mark',
    });

    expect(onChange).toHaveBeenCalledWith(['food', 'rent']);
    expect(foodMarks.length).toBeGreaterThan(0);
  });

  it('does not change when group or option is disabled or readonly', () => {
    const onChange = jest.fn();
    const disabledGroup = renderCheckboxGroup({
      disabled: true,
      onChange,
    });
    const readonlyGroup = renderCheckboxGroup({
      readonly: true,
      onChange,
    });
    const disabledOption = renderCheckboxGroup({
      options: [
        { value: 'food', label: 'Food' },
        { value: 'rent', label: 'Rent', disabled: true },
      ],
      onChange,
    });

    const disabledControl = pressGroupOption(disabledGroup, 'food');
    pressGroupOption(readonlyGroup, 'food');
    pressGroupOption(disabledOption, 'rent');

    expect(onChange).not.toHaveBeenCalled();
    expect(disabledControl.props.disabled).toBe(true);
  });

  it('uses button display type and block layout for options', () => {
    const onChange = jest.fn();
    const testRenderer = renderCheckboxGroup({
      block: true,
      defaultValue: ['food'],
      displayType: 'button',
      onChange,
    });

    const option = pressGroupOption(testRenderer, 'rent');
    const root = testRenderer.root.findByProps({ testID: 'checkbox-group-root' });

    expect(onChange).toHaveBeenCalledWith(['food', 'rent']);
    expect(root.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ width: '100%' })]),
    );
    expect(option.props.disabled).toBe(false);
  });
});
