import React from 'react';
import { View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Calendar } from '../src/Calendar';
function renderCalendar(props: React.ComponentProps<typeof Calendar>) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><Calendar {...props} /></>);
  });
  return testRenderer!;
}
function renderCalendarRange(props: React.ComponentProps<typeof Calendar.Range>) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><Calendar.Range {...props} /></>);
  });
  return testRenderer!;
}
function textOf(testRenderer: renderer.ReactTestRenderer) {
  return JSON.stringify(testRenderer.toJSON());
}
function pressByLabel(testRenderer: renderer.ReactTestRenderer, label: string) {
  const node = testRenderer.root.find(item => item.props.accessibilityLabel === label);
  act(() => {
    node.props.onPress({});
  });
}
function findNodesWithStyle(testRenderer: renderer.ReactTestRenderer, markerStyle: Record<string, unknown>) {
  return testRenderer.root.findAll(node => {
    const style = node.props.style;
    return node.type === View && Array.isArray(style) && style.includes(markerStyle);
  });
}
describe('Calendar', () => {
  it('selects uncontrolled date values and renders marks', () => {
    const onChange = jest.fn();
    const testRenderer = renderCalendar({
      defaultValue: '2026-05-01',
      marks: [{
        date: '2026-05-07',
        content: 'dot'
      }],
      onChange
    });
    pressByLabel(testRenderer, 'Select 2026-05-07');
    expect(onChange).toHaveBeenCalledWith('2026-05-07');
    expect(textOf(testRenderer)).toContain('2026-05-07');
    expect(textOf(testRenderer)).toContain('dot');
  });
  it('keeps controlled month display while reporting changes', () => {
    const onChange = jest.fn();
    const testRenderer = renderCalendar({
      mode: 'month',
      onChange,
      value: '2026-05'
    });
    pressByLabel(testRenderer, 'Select 2026-06');
    expect(onChange).toHaveBeenCalledWith('2026-06');
    expect(textOf(testRenderer)).toContain('2026-05');
  });
  it('blocks disabled dates and exposes disabled state', () => {
    const onChange = jest.fn();
    const testRenderer = renderCalendar({
      defaultValue: '2026-05-01',
      disabledDate: value => value === '2026-05-07',
      onChange
    });
    const disabledCell = testRenderer.root.find(node => node.props.accessibilityLabel === 'Select 2026-05-07');
    act(() => {
      disabledCell.props.onPress({});
    });
    expect(disabledCell.props.accessibilityState.disabled).toBe(true);
    expect(onChange).not.toHaveBeenCalled();
  });
  it('delays single value submission in confirm mode', () => {
    const onChange = jest.fn();
    const onConfirm = jest.fn();
    const testRenderer = renderCalendar({
      defaultValue: '2026-05-01',
      onChange,
      onConfirm,
      showConfirm: true
    });
    pressByLabel(testRenderer, 'Select 2026-05-07');
    expect(onChange).not.toHaveBeenCalled();
    pressByLabel(testRenderer, 'Confirm date');
    expect(onChange).toHaveBeenCalledWith('2026-05-07');
    expect(onConfirm).toHaveBeenCalledWith('2026-05-07');
  });
  it('formats selected value and applies slot styles', () => {
    const gridStyle = {
      opacity: 0.61
    };
    const testRenderer = renderCalendar({
      format: 'dateSlash',
      value: '2026-05-07',
      styles: {
        grid: gridStyle
      }
    });
    expect(textOf(testRenderer)).toContain('2026/05/07');
    expect(findNodesWithStyle(testRenderer, gridStyle)).toHaveLength(1);
  });
  it('normalizes range values after complete selection', () => {
    const onChange = jest.fn();
    const testRenderer = renderCalendarRange({
      mode: 'month',
      onChange,
      value: ['2026-05', '2026-05']
    });
    pressByLabel(testRenderer, 'Select range 2026-08');
    expect(onChange).not.toHaveBeenCalled();
    pressByLabel(testRenderer, 'Select range 2026-06');
    expect(onChange).toHaveBeenCalledWith(['2026-06', '2026-08']);
  });
  it('exposes cell button and selected state', () => {
    const testRenderer = renderCalendar({
      value: '2026-05-07'
    });
    const selectedCell = testRenderer.root.find(node => node.props.accessibilityLabel === 'Select 2026-05-07');
    const navigationButton = testRenderer.root.find(node => node.props.accessibilityLabel === 'Previous panel');
    expect(selectedCell.props.accessibilityRole).toBe('button');
    expect(selectedCell.props.accessibilityState.selected).toBe(true);
    expect(navigationButton.props.accessibilityRole).toBe('button');
  });
});
