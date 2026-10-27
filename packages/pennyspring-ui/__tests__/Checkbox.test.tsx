import React from 'react';
import { Text as RNText } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Checkbox } from '../src/Checkbox';
import type { CheckboxGroupProps, CheckboxProps } from '../src/Checkbox';
import { Text } from '../src/Text';

const GROUP_OPTIONS = [
  { value: 'food', label: '餐饮' },
  { value: 'rent', label: '房租' },
  { value: 2026, label: <RNText>年份</RNText> },
];

function renderCheckbox(props: Partial<CheckboxProps> = {}) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<Checkbox {...props}>保存记录</Checkbox>);
  });
  return testRenderer!;
}

function renderCheckboxGroup(props: Partial<CheckboxGroupProps> = {}) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(
      <Checkbox.Group options={GROUP_OPTIONS} {...props} />,
    );
  });
  return testRenderer!;
}

function pressControl(
  testRenderer: renderer.ReactTestRenderer,
  testID: string,
) {
  const [control] = testRenderer.root.findAll(
    node => typeof node.props.onPress === 'function' && node.props.testID === testID,
  );
  act(() => {
    control.props.onPress();
  });
  return control;
}

function hasTestID(testRenderer: renderer.ReactTestRenderer, testID: string) {
  return testRenderer.root.findAllByProps({ testID }).length > 0;
}

describe('Checkbox', () => {
  it('toggles an uncontrolled checkbox and reports the next boolean', () => {
    const onChange = jest.fn();
    const testRenderer = renderCheckbox({ defaultValue: false, onChange });

    pressControl(testRenderer, 'checkbox-control');

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('keeps a controlled checkbox derived from props while reporting changes', () => {
    const onChange = jest.fn();
    const testRenderer = renderCheckbox({ value: false, onChange });

    pressControl(testRenderer, 'checkbox-control');

    expect(onChange).toHaveBeenCalledWith(true);
    expect(hasTestID(testRenderer, 'checkbox-mark-check')).toBe(false);
  });

  it('does not toggle when disabled or readonly', () => {
    const onChange = jest.fn();
    const disabledRenderer = renderCheckbox({ disabled: true, onChange });
    const readonlyRenderer = renderCheckbox({ readonly: true, onChange });

    const disabledControl = pressControl(disabledRenderer, 'checkbox-control');
    pressControl(readonlyRenderer, 'checkbox-control');

    expect(onChange).not.toHaveBeenCalled();
    expect(disabledControl.props.disabled).toBe(true);
  });

  it('reports full selection when pressing an indeterminate checkbox', () => {
    const onChange = jest.fn();
    let testRenderer: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(
        <Checkbox indeterminate value={false} onChange={onChange}>
          部分选中（3 / 8）
        </Checkbox>,
      );
    });
    const target = testRenderer!;

    pressControl(target, 'checkbox-control');
    expect(onChange).toHaveBeenCalledWith(true);

    act(() => {
      target.update(
        <Checkbox indeterminate={false} value onChange={onChange}>
          部分选中（3 / 8）
        </Checkbox>,
      );
    });
    expect(hasTestID(target, 'checkbox-mark-check')).toBe(true);
    expect(hasTestID(target, 'checkbox-mark-minus')).toBe(false);
  });

  it('renders the half-selected mark when indeterminate and checked are both true', () => {
    const testRenderer = renderCheckbox({ indeterminate: true, value: true });

    expect(hasTestID(testRenderer, 'checkbox-mark-minus')).toBe(true);
    expect(hasTestID(testRenderer, 'checkbox-mark-check')).toBe(false);
  });

  it('renders an inner tick instead of a box indicator for the button display type', () => {
    const unselectedRenderer = renderCheckbox({ defaultValue: false, displayType: 'button' });
    const selectedRenderer = renderCheckbox({ defaultValue: true, displayType: 'button' });

    expect(hasTestID(unselectedRenderer, 'checkbox-indicator')).toBe(false);
    expect(hasTestID(unselectedRenderer, 'checkbox-mark-check')).toBe(false);
    expect(hasTestID(selectedRenderer, 'checkbox-indicator')).toBe(false);
    expect(hasTestID(selectedRenderer, 'checkbox-mark-check')).toBe(true);
  });

  it('maps chip foreground color and weight to the selection state', () => {
    const selectedLabel = renderCheckbox({ defaultValue: true, displayType: 'button' });
    const unselectedLabel = renderCheckbox({ defaultValue: false, displayType: 'button' });
    const disabledLabel = renderCheckbox({ defaultValue: true, disabled: true, displayType: 'button' });

    const readLabel = (target: renderer.ReactTestRenderer) =>
      target.root.findByProps({ testID: 'checkbox-label' });
    const readTextProps = (target: renderer.ReactTestRenderer) =>
      readLabel(target).findByType(Text).props;

    expect(readTextProps(selectedLabel)).toMatchObject({
      color: 'primary',
      weight: 'semibold',
    });
    expect(readTextProps(unselectedLabel)).toMatchObject({
      color: 'secondary',
      weight: 'regular',
    });
    expect(readTextProps(disabledLabel)).toMatchObject({ color: 'quaternary' });
  });

  it('dims the label of a disabled or readonly box row', () => {
    const disabledRow = renderCheckbox({ disabled: true, defaultValue: true });
    const readonlyRow = renderCheckbox({ readonly: true, defaultValue: true });

    const readTextProps = (target: renderer.ReactTestRenderer) =>
      target.root.findByProps({ testID: 'checkbox-label' }).findByType(Text).props;

    expect(readTextProps(disabledRow)).toMatchObject({ color: 'tertiary' });
    expect(readTextProps(readonlyRow)).toMatchObject({ color: 'secondary' });
  });
});

describe('Checkbox.Group', () => {
  it('prefers option label over labelText and value', () => {
    const testRenderer = renderCheckboxGroup({
      options: [
        { value: 'label-first', label: '标签优先', labelText: 'labelText 落后' },
        { value: 'text-second', labelText: 'labelText 胜出' },
        { value: 'value-last' },
      ],
    });

    const content = JSON.stringify(testRenderer.toJSON());

    expect(content).toContain('标签优先');
    expect(content).not.toContain('labelText 落后');
    expect(content).toContain('labelText 胜出');
    expect(content).toContain('value-last');
  });

  it('adds and removes option values immutably', () => {
    const initialValue = ['food'];
    const onChange = jest.fn();
    const testRenderer = renderCheckboxGroup({
      defaultValue: initialValue,
      onChange,
    });

    pressControl(testRenderer, 'checkbox-group-option-rent');
    pressControl(testRenderer, 'checkbox-group-option-food');

    expect(onChange).toHaveBeenNthCalledWith(1, ['food', 'rent']);
    expect(onChange).toHaveBeenNthCalledWith(2, ['rent']);
    expect(initialValue).toEqual(['food']);
  });

  it('keeps a controlled group value derived from props while reporting changes', () => {
    const onChange = jest.fn();
    const testRenderer = renderCheckboxGroup({ value: ['food'], onChange });

    pressControl(testRenderer, 'checkbox-group-option-rent');

    expect(onChange).toHaveBeenCalledWith(['food', 'rent']);
    expect(hasTestID(testRenderer, 'checkbox-group-option-food-mark-check')).toBe(true);
    expect(hasTestID(testRenderer, 'checkbox-group-option-rent-mark-check')).toBe(false);
  });

  it('does not change when the group or an option is disabled or readonly', () => {
    const onChange = jest.fn();
    const disabledGroup = renderCheckboxGroup({ disabled: true, onChange });
    const readonlyGroup = renderCheckboxGroup({ readonly: true, onChange });
    const disabledOption = renderCheckboxGroup({
      options: [
        { value: 'food', label: '餐饮' },
        { value: 'rent', label: '房租', disabled: true },
      ],
      onChange,
    });

    const disabledControl = pressControl(
      disabledGroup,
      'checkbox-group-option-food',
    );
    pressControl(readonlyGroup, 'checkbox-group-option-food');
    pressControl(disabledOption, 'checkbox-group-option-rent');

    expect(onChange).not.toHaveBeenCalled();
    expect(disabledControl.props.disabled).toBe(true);
  });

  it('renders ticks instead of box indicators for the button display type', () => {
    const testRenderer = renderCheckboxGroup({
      defaultValue: ['food'],
      displayType: 'button',
    });

    expect(hasTestID(testRenderer, 'checkbox-group-option-food-indicator')).toBe(false);
    expect(hasTestID(testRenderer, 'checkbox-group-option-food-mark-check')).toBe(true);
    expect(hasTestID(testRenderer, 'checkbox-group-option-rent-mark-check')).toBe(false);
  });
});
