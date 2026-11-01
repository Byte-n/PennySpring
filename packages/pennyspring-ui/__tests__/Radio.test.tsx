import React from 'react';
import { Text as RNText } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Radio } from '../src/Radio';
import type { RadioGroupProps, RadioProps } from '../src/Radio';
import { Text } from '../src/Text';

const GROUP_OPTIONS = [
  { value: 'category', label: '按分类统计' },
  { value: 'tag', label: '按标签统计' },
  { value: 2026, label: <RNText>按年份统计</RNText> },
] as const;

function renderRadio(props: Partial<RadioProps> = {}) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<Radio {...props}>按分类统计</Radio>);
  });
  return testRenderer!;
}

function renderRadioGroup(props: Partial<RadioGroupProps> = {}) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(
      <Radio.Group options={[...GROUP_OPTIONS]} {...props} />,
    );
  });
  return testRenderer!;
}

function pressOption(testRenderer: renderer.ReactTestRenderer, testID: string) {
  const [control] = testRenderer.root.findAll(
    node =>
      typeof node.props.onPress === 'function' && node.props.testID === testID,
  );
  act(() => {
    control.props.onPress();
  });
  return control;
}

function hasTestID(testRenderer: renderer.ReactTestRenderer, testID: string) {
  return testRenderer.root.findAllByProps({ testID }).length > 0;
}

function readLabelProps(
  testRenderer: renderer.ReactTestRenderer,
  testID: string,
) {
  return testRenderer.root.findByProps({ testID }).findByType(Text).props;
}

describe('Radio', () => {
  it('reports true when pressing an unselected radio', () => {
    const onChange = jest.fn();
    const testRenderer = renderRadio({ defaultValue: false, onChange });

    pressOption(testRenderer, 'radio');

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('stays selected after pressing again instead of being cleared', () => {
    const onChange = jest.fn();
    const testRenderer = renderRadio({ onChange });

    pressOption(testRenderer, 'radio');
    pressOption(testRenderer, 'radio');

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('keeps a controlled radio derived from props while reporting each press', () => {
    const onChange = jest.fn();
    const testRenderer = renderRadio({ value: false, onChange });

    pressOption(testRenderer, 'radio');
    pressOption(testRenderer, 'radio');

    expect(onChange).toHaveBeenNthCalledWith(1, true);
    expect(onChange).toHaveBeenNthCalledWith(2, true);
  });

  it('does not select when disabled or readonly', () => {
    const onChange = jest.fn();
    const disabledRenderer = renderRadio({ disabled: true, onChange });
    const readonlyRenderer = renderRadio({ readonly: true, onChange });

    const disabledControl = pressOption(disabledRenderer, 'radio');
    pressOption(readonlyRenderer, 'radio');

    expect(onChange).not.toHaveBeenCalled();
    expect(disabledControl.props.disabled).toBe(true);
  });

  it('maps chip foreground color and weight to the selection state', () => {
    const selectedRenderer = renderRadio({
      defaultValue: true,
      displayType: 'button',
    });
    const unselectedRenderer = renderRadio({
      defaultValue: false,
      displayType: 'button',
    });
    const disabledRenderer = renderRadio({
      defaultValue: true,
      disabled: true,
      displayType: 'button',
    });

    expect(readLabelProps(selectedRenderer, 'radio-label')).toMatchObject({
      color: 'primary',
      weight: 'semibold',
    });
    expect(readLabelProps(unselectedRenderer, 'radio-label')).toMatchObject({
      color: 'secondary',
      weight: 'regular',
    });
    expect(readLabelProps(disabledRenderer, 'radio-label')).toMatchObject({
      color: 'quaternary',
    });
  });

  it('dims the label of a disabled or readonly row', () => {
    const disabledRenderer = renderRadio({
      disabled: true,
      defaultValue: true,
    });
    const readonlyRenderer = renderRadio({
      readonly: true,
      defaultValue: true,
    });

    expect(readLabelProps(disabledRenderer, 'radio-label')).toMatchObject({
      color: 'tertiary',
    });
    expect(readLabelProps(readonlyRenderer, 'radio-label')).toMatchObject({
      color: 'secondary',
    });
  });

  it('renders the outer ring only for the default display type', () => {
    const defaultRenderer = renderRadio({ defaultValue: true });
    const chipRenderer = renderRadio({
      defaultValue: true,
      displayType: 'button',
    });

    expect(hasTestID(defaultRenderer, 'radio-control')).toBe(true);
    expect(hasTestID(chipRenderer, 'radio-control')).toBe(false);
  });
});

describe('Radio.Group', () => {
  it('prefers option label over labelText and value', () => {
    const testRenderer = renderRadioGroup({
      options: [
        {
          value: 'label-first',
          label: '按分类统计',
          labelText: 'labelText 落后',
        },
        { value: 'text-second', labelText: '按标签统计' },
        { value: 'value-last' },
      ],
    });

    const content = JSON.stringify(testRenderer.toJSON());

    expect(content).toContain('按分类统计');
    expect(content).not.toContain('labelText 落后');
    expect(content).toContain('按标签统计');
    expect(content).toContain('value-last');
  });

  it('keeps only one option selected at a time', () => {
    const onChange = jest.fn();
    const testRenderer = renderRadioGroup({
      defaultValue: 'category',
      onChange,
    });

    pressOption(testRenderer, 'radio-group-option-tag');
    pressOption(testRenderer, 'radio-group-option-category');
    pressOption(testRenderer, 'radio-group-option-2026');

    expect(onChange).toHaveBeenNthCalledWith(1, 'tag');
    expect(onChange).toHaveBeenNthCalledWith(2, 'category');
    expect(onChange).toHaveBeenNthCalledWith(3, 2026);
  });

  it('does not report when pressing the already selected option', () => {
    const onChange = jest.fn();
    const testRenderer = renderRadioGroup({
      defaultValue: 'category',
      onChange,
    });

    pressOption(testRenderer, 'radio-group-option-category');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('keeps a controlled group value derived from props while reporting each press', () => {
    const onChange = jest.fn();
    const testRenderer = renderRadioGroup({ value: 'category', onChange });

    pressOption(testRenderer, 'radio-group-option-tag');
    pressOption(testRenderer, 'radio-group-option-tag');

    expect(onChange).toHaveBeenNthCalledWith(1, 'tag');
    expect(onChange).toHaveBeenNthCalledWith(2, 'tag');
  });

  it('does not select when the group or an option is disabled or readonly', () => {
    const onChange = jest.fn();
    const disabledGroup = renderRadioGroup({ disabled: true, onChange });
    const readonlyGroup = renderRadioGroup({ readonly: true, onChange });
    const disabledOption = renderRadioGroup({
      options: [
        { value: 'category', label: '按分类统计' },
        { value: 'tag', label: '按标签统计', disabled: true },
      ],
      onChange,
    });

    const disabledControl = pressOption(
      disabledGroup,
      'radio-group-option-category',
    );
    pressOption(readonlyGroup, 'radio-group-option-category');
    pressOption(disabledOption, 'radio-group-option-tag');

    expect(onChange).not.toHaveBeenCalled();
    expect(disabledControl.props.disabled).toBe(true);
  });

  it('renders chip options without the outer ring and highlights the selected chip', () => {
    const testRenderer = renderRadioGroup({
      defaultValue: 'category',
      displayType: 'button',
    });

    expect(hasTestID(testRenderer, 'radio-group-option-category-control')).toBe(
      false,
    );
    expect(
      readLabelProps(testRenderer, 'radio-group-option-category-label'),
    ).toMatchObject({
      color: 'primary',
      weight: 'semibold',
    });
    expect(
      readLabelProps(testRenderer, 'radio-group-option-tag-label'),
    ).toMatchObject({
      color: 'secondary',
      weight: 'regular',
    });
  });
});
