import React from 'react';
import { Text as RNText } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Segmented } from '../src/Segmented';
import type { SegmentedProps } from '../src/Segmented';

function renderSegmented(props: Partial<SegmentedProps> = {}) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <>
        <Segmented options={['day', 'month', 'year']} {...props} />
      </>,
    );
  });

  return testRenderer!;
}

function textContent(testRenderer: renderer.ReactTestRenderer) {
  return JSON.stringify(testRenderer.toJSON());
}

function pressByValue(
  testRenderer: renderer.ReactTestRenderer,
  value: string | number,
) {
  const target = testRenderer.root.findByProps({
    testID: `segmented-item-${String(value)}`,
  });

  act(() => {
    target.props.onPress();
  });

  return target;
}

describe('Segmented', () => {
  it('renders raw options using each option as value and label', () => {
    const testRenderer = renderSegmented({ options: ['day', 'month', 2026] });
    const content = textContent(testRenderer);

    expect(content).toContain('day');
    expect(content).toContain('month');
    expect(content).toContain('2026');
  });

  it('renders labeled options with icon and optional label', () => {
    const testRenderer = renderSegmented({
      options: [
        { value: 'chart', icon: <RNText>Icon</RNText>, label: 'Chart' },
        { value: 'icon-only', icon: <RNText>Only</RNText> },
      ],
    });
    const content = textContent(testRenderer);

    expect(content).toContain('Icon');
    expect(content).toContain('Chart');
    expect(content).toContain('Only');
  });

  it('updates uncontrolled value and reports the changed value', () => {
    const onChange = jest.fn();
    const testRenderer = renderSegmented({ defaultValue: 'day', onChange });

    pressByValue(testRenderer, 'month');

    expect(onChange).toHaveBeenCalledWith('month');
  });

  it('keeps a controlled value derived from props while reporting presses', () => {
    const onChange = jest.fn();
    const testRenderer = renderSegmented({ onChange, value: 'day' });

    pressByValue(testRenderer, 'month');
    pressByValue(testRenderer, 'year');

    expect(onChange).toHaveBeenNthCalledWith(1, 'month');
    expect(onChange).toHaveBeenNthCalledWith(2, 'year');
    expect(textContent(testRenderer)).toContain('day');
  });

  it('does not report duplicate changes for the selected value', () => {
    const onChange = jest.fn();
    const testRenderer = renderSegmented({ defaultValue: 'day', onChange });

    pressByValue(testRenderer, 'day');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('blocks selection when disabled at component or option level', () => {
    const onChange = jest.fn();
    const disabledRoot = renderSegmented({ disabled: true, onChange });
    const disabledOption = renderSegmented({
      defaultValue: 'day',
      onChange,
      options: [
        { value: 'day', label: 'Day' },
        { value: 'month', label: 'Month', disabled: true },
      ],
    });

    pressByValue(disabledRoot, 'month');
    const option = pressByValue(disabledOption, 'month');

    expect(onChange).not.toHaveBeenCalled();
    expect(option.props.disabled).toBe(true);
  });
});

describe('Segmented - labelText and label separation', () => {
  it('renders labelText as text content', () => {
    const testRenderer = renderSegmented({
      options: [{ value: 'a', labelText: 'Alpha' }],
    });

    expect(textContent(testRenderer)).toContain('Alpha');
  });

  it('renders label ReactNode as custom content', () => {
    const testRenderer = renderSegmented({
      options: [{ value: 'a', label: <RNText>CustomLabel</RNText> }],
    });

    expect(textContent(testRenderer)).toContain('CustomLabel');
  });

  it('renders nothing when label is null', () => {
    const testRenderer = renderSegmented({
      options: [
        { value: 'a', labelText: 'Alpha' },
        { value: 'b', label: null },
      ],
    });
    const itemB = testRenderer.root.findByProps({ testID: 'segmented-item-b' });
    const hasBLabel = itemB
      .findAllByType(RNText)
      .some(
        (node: { props: { children?: unknown } }) => node.props.children === 'b',
      );

    expect(textContent(testRenderer)).toContain('Alpha');
    expect(hasBLabel).toBe(false);
  });

  it('uses labelText over the raw value for labeled options', () => {
    const testRenderer = renderSegmented({
      options: [{ value: 'a', labelText: 'Display' }],
    });

    expect(textContent(testRenderer)).toContain('Display');
  });
});

describe('Segmented - Text semantic props', () => {
  it('maps each size to the matching text size', () => {
    const smallText = renderSegmented({
      options: ['a'],
      size: 'small',
    }).root.findByProps({ children: 'a' });
    const normalText = renderSegmented({
      options: ['a'],
      size: 'normal',
    }).root.findByProps({ children: 'a' });
    const largeText = renderSegmented({
      options: ['a'],
      size: 'large',
    }).root.findByProps({ children: 'a' });

    expect(smallText.props.size).toBe('xs');
    expect(normalText.props.size).toBe('sm');
    expect(largeText.props.size).toBe('md');
  });

  it('uses default text color and semibold weight for the selected label', () => {
    const testRenderer = renderSegmented({
      defaultValue: 'day',
      options: ['day', 'month'],
    });
    const selectedText = testRenderer.root.findByProps({ children: 'day' });
    const unselectedText = testRenderer.root.findByProps({ children: 'month' });

    expect(selectedText.props.color).toBe('default');
    expect(selectedText.props.weight).toBe('semibold');
    expect(unselectedText.props.color).toBe('secondary');
    expect(unselectedText.props.weight).toBe('regular');
  });

  it('dims disabled labels and keeps a selected disabled label readable', () => {
    const testRenderer = renderSegmented({
      defaultValue: 'a',
      options: [
        { value: 'a', labelText: 'Selected' },
        { value: 'b', labelText: 'Off', disabled: true },
        { value: 'c', labelText: 'SelectedOff', disabled: true },
      ],
    });

    expect(testRenderer.root.findByProps({ children: 'Selected' }).props.color).toBe(
      'default',
    );
    expect(testRenderer.root.findByProps({ children: 'Off' }).props.color).toBe(
      'quaternary',
    );

    const selectedDisabled = renderSegmented({
      defaultValue: 'c',
      options: [
        { value: 'a', labelText: 'Selected' },
        { value: 'c', labelText: 'SelectedOff', disabled: true },
      ],
    });

    expect(
      selectedDisabled.root.findByProps({ children: 'SelectedOff' }).props.color,
    ).toBe('tertiary');
  });
});
