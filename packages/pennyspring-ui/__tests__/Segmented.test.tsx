import React from 'react';
import { Text as RNText } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Segmented } from '../src/Segmented';
import type { SegmentedProps } from '../src/Segmented';
function renderSegmented(props: Partial<SegmentedProps> = {}) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><Segmented options={['day', 'month', 'year']} {...props} /></>);
  });
  return testRenderer!;
}
function textContent(testRenderer: renderer.ReactTestRenderer) {
  return JSON.stringify(testRenderer.toJSON());
}
function pressByValue(testRenderer: renderer.ReactTestRenderer, value: string | number) {
  const target = testRenderer.root.findByProps({
    testID: `segmented-item-${String(value)}`
  });
  act(() => {
    target.props.onPress();
  });
  return target;
}
describe('Segmented', () => {
  it('renders raw options using each option as value and label', () => {
    const testRenderer = renderSegmented({
      options: ['day', 'month', 2026]
    });
    const content = textContent(testRenderer);
    expect(content).toContain('day');
    expect(content).toContain('month');
    expect(content).toContain('2026');
  });
  it('renders labeled options with icon and optional label', () => {
    const testRenderer = renderSegmented({
      options: [{
        value: 'chart',
        icon: <RNText>Icon</RNText>,
        label: 'Chart'
      }, {
        value: 'icon-only',
        icon: <RNText>Only</RNText>
      }]
    });
    const content = textContent(testRenderer);
    expect(content).toContain('Icon');
    expect(content).toContain('Chart');
    expect(content).toContain('Only');
  });
  it('updates uncontrolled value and reports changed value', () => {
    const onChange = jest.fn();
    const testRenderer = renderSegmented({
      defaultValue: 'day',
      onChange
    });
    pressByValue(testRenderer, 'month');
    expect(onChange).toHaveBeenCalledWith('month');
  });
  it('keeps selected state derived from controlled value', () => {
    const onChange = jest.fn();
    const testRenderer = renderSegmented({
      value: 'day',
      onChange
    });
    pressByValue(testRenderer, 'month');
    const content = textContent(testRenderer);
    expect(onChange).toHaveBeenCalledWith('month');
    expect(content).toContain('day');
    expect(content).toContain('month');
  });
  it('does not report duplicate changes for the selected value', () => {
    const onChange = jest.fn();
    const testRenderer = renderSegmented({
      defaultValue: 'day',
      onChange
    });
    pressByValue(testRenderer, 'day');
    expect(onChange).not.toHaveBeenCalled();
  });
  it('blocks selection when disabled at component or option level', () => {
    const onChange = jest.fn();
    const disabledRoot = renderSegmented({
      disabled: true,
      onChange
    });
    const disabledOption = renderSegmented({
      defaultValue: 'day',
      onChange,
      options: [{
        value: 'day',
        label: 'Day'
      }, {
        value: 'month',
        label: 'Month',
        disabled: true
      }]
    });
    pressByValue(disabledRoot, 'month');
    const option = pressByValue(disabledOption, 'month');
    expect(onChange).not.toHaveBeenCalled();
    expect(option.props.disabled).toBe(true);
  });
});
