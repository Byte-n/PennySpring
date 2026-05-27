import React from 'react';
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
function pressByTestID(testRenderer: renderer.ReactTestRenderer, testID: string) {
  const node = testRenderer.root.findByProps({ testID });
  act(() => {
    node.props.onPress({});
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
    pressByTestID(testRenderer, 'calendar-cell-2026-05-07');
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
    pressByTestID(testRenderer, 'calendar-cell-2026-06');
    expect(onChange).toHaveBeenCalledWith('2026-06');
    expect(textOf(testRenderer)).toContain('2026-05');
  });
  it('blocks disabled dates', () => {
    const onChange = jest.fn();
    const testRenderer = renderCalendar({
      defaultValue: '2026-05-01',
      disabledDate: value => value === '2026-05-07',
      onChange
    });
    const disabledCell = testRenderer.root.findByProps({ testID: 'calendar-cell-2026-05-07' });
    act(() => {
      disabledCell.props.onPress({});
    });
    expect(disabledCell.props.disabled).toBe(true);
    expect(onChange).not.toHaveBeenCalled();
  });
  it('delays single value submission in confirm mode', () => {
    const onChange = jest.fn();
    const onOk = jest.fn();
    const testRenderer = renderCalendar({
      defaultValue: '2026-05-01',
      onChange,
      onOk,
      showConfirm: true
    });
    pressByTestID(testRenderer, 'calendar-cell-2026-05-07');
    expect(onChange).not.toHaveBeenCalled();
    pressByTestID(testRenderer, 'calendar-confirm');
    expect(onChange).toHaveBeenCalledWith('2026-05-07');
    expect(onOk).toHaveBeenCalledWith('2026-05-07');
  });
  it('normalizes range values after complete selection', () => {
    const onChange = jest.fn();
    const testRenderer = renderCalendarRange({
      mode: 'month',
      onChange,
      value: ['2026-05', '2026-05']
    });
    pressByTestID(testRenderer, 'calendar-cell-2026-08');
    expect(onChange).not.toHaveBeenCalled();
    pressByTestID(testRenderer, 'calendar-cell-2026-06');
    expect(onChange).toHaveBeenCalledWith(['2026-06', '2026-08']);
  });
  it('exposes cell as pressable and navigation buttons', () => {
    const testRenderer = renderCalendar({
      value: '2026-05-07'
    });
    const selectedCell = testRenderer.root.findByProps({ testID: 'calendar-cell-2026-05-07' });
    const navigationButton = testRenderer.root.findByProps({ testID: 'calendar-nav-prev' });
    expect(selectedCell.props.onPress).toBeDefined();
    expect(navigationButton.props.onPress).toBeDefined();
  });
  it('prevents range today action when today is disabled by disabledDate', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-05-15T00:00:00.000Z'));
    const onChange = jest.fn();
    const testRenderer = renderCalendarRange({
      onChange,
      showToday: true,
      disabledDate: value => value === '2026-05-15'
    });
    const todayButton = testRenderer.root.findByProps({ hitSlop: 8 });
    act(() => {
      todayButton.props.onPress({});
    });
    pressByTestID(testRenderer, 'calendar-cell-2026-05-16');
    expect(onChange).not.toHaveBeenCalled();
    jest.useRealTimers();
  });
  it('disables navigation and footer actions when calendar is disabled', () => {
    const onCancel = jest.fn();
    const onOk = jest.fn();
    const testRenderer = renderCalendar({
      defaultValue: '2026-05-01',
      disabled: true,
      showToday: true,
      showConfirm: true,
      onCancel,
      onOk
    });
    const prevButton = testRenderer.root.findByProps({ testID: 'calendar-nav-prev' });
    const nextButton = testRenderer.root.findByProps({ testID: 'calendar-nav-next' });
    const confirmButton = testRenderer.root.findByProps({ testID: 'calendar-confirm' });
    expect(prevButton.props.disabled).toBe(true);
    expect(nextButton.props.disabled).toBe(true);
    expect(confirmButton.props.disabled).toBe(true);
    const json = textOf(testRenderer);
    expect(json).toContain('calendar-nav-prev');
    expect(onCancel).not.toHaveBeenCalled();
    expect(onOk).not.toHaveBeenCalled();
  });
});
