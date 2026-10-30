import React from 'react';
import { Text as RNText } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { CalendarPicker, CalendarPickerView } from '../src';
import { DisplayInput } from '../src/DisplayInput';

function makeDate(year: number, month: number, day: number): Date {
  // month 为 1 起始
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

const BASE_DATE = makeDate(2026, 10, 25);

function renderCalendarPicker(props: React.ComponentProps<typeof CalendarPicker>) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(<><CalendarPicker {...props} /></>);
  });

  return testRenderer!;
}

function renderCalendarPickerRange(
  props: React.ComponentProps<typeof CalendarPicker.Range>,
) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(<><CalendarPicker.Range {...props} /></>);
  });

  return testRenderer!;
}

function pressByTestID(testRenderer: renderer.ReactTestRenderer, testID: string) {
  const node = testRenderer.root.findByProps({ testID });

  act(() => {
    node.props.onPress({});
  });
}

function triggerValueText(testRenderer: renderer.ReactTestRenderer) {
  return testRenderer.root.findByType(DisplayInput).props.valueText;
}

describe('CalendarPicker', () => {
  it('shows the formatted date on the trigger', () => {
    // Arrange & Act
    const testRenderer = renderCalendarPicker({ value: BASE_DATE });

    // Assert
    expect(triggerValueText(testRenderer)).toBe('2026-10-25');
  });

  it('keeps the trigger empty when no date is selected', () => {
    // Arrange & Act
    const testRenderer = renderCalendarPicker({});

    // Assert
    expect(triggerValueText(testRenderer)).toBeUndefined();
  });

  it('renders custom children as the trigger value node', () => {
    // Arrange & Act
    const testRenderer = renderCalendarPicker({
      children: <RNText>自定义日期</RNText>,
      value: BASE_DATE,
    });

    // Assert
    expect(JSON.stringify(testRenderer.toJSON())).toContain('自定义日期');
  });

  it('clears the selected date when allowClear is pressed', () => {
    // Arrange
    const onClear = jest.fn();
    const testRenderer = renderCalendarPicker({
      allowClear: true,
      defaultValue: BASE_DATE,
      onClear,
    });

    // Act
    pressByTestID(testRenderer, 'picker-trigger-clear-button');

    // Assert
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(triggerValueText(testRenderer)).toBeUndefined();
  });

  it('hides the clear button when readonly', () => {
    // Arrange & Act
    const testRenderer = renderCalendarPicker({
      allowClear: true,
      readonly: true,
      value: BASE_DATE,
    });

    // Assert
    expect(
      testRenderer.root.findAllByProps({ testID: 'picker-trigger-clear-button' }),
    ).toHaveLength(0);
  });

  it('shows the confirmed date on the trigger for uncontrolled usage', () => {
    // Arrange
    jest.useFakeTimers().setSystemTime(new Date(2026, 9, 25, 12));
    const testRenderer = renderCalendarPicker({ defaultOpen: true });

    // Act
    pressByTestID(testRenderer, 'calendar-cell-2026-10-20');
    pressByTestID(testRenderer, 'picker-ok-button');

    // Assert
    expect(triggerValueText(testRenderer)).toBe('2026-10-20');
    jest.useRealTimers();
  });

  it('zeros the time part for date precision values', () => {
    // Arrange
    const onChange = jest.fn();
    const onOk = jest.fn();
    const testRenderer = renderCalendarPicker({
      defaultValue: new Date(2026, 9, 25, 14, 30, 15),
      defaultOpen: true,
      onChange,
      onOk,
    });

    // Act
    pressByTestID(testRenderer, 'calendar-cell-2026-10-20');
    pressByTestID(testRenderer, 'picker-ok-button');

    // Assert
    const [changeDate] = onChange.mock.calls[0];
    const [okDate] = onOk.mock.calls[0];
    [changeDate, okDate].forEach(date => {
      expect(date.getDate()).toBe(20);
      expect(date.getHours()).toBe(0);
      expect(date.getMinutes()).toBe(0);
      expect(date.getSeconds()).toBe(0);
    });
  });

  it('zeros the time part of the committed range', () => {
    // Arrange
    const onOk = jest.fn();
    const testRenderer = renderCalendarPickerRange({
      defaultValue: [
        new Date(2026, 9, 25, 14, 30),
        new Date(2026, 9, 28, 16, 45),
      ],
      defaultOpen: true,
      onOk,
    });

    // Act
    pressByTestID(testRenderer, 'calendar-cell-2026-10-20');
    pressByTestID(testRenderer, 'calendar-cell-2026-10-22');
    pressByTestID(testRenderer, 'picker-ok-button');

    // Assert
    const [nextRange] = onOk.mock.calls[0];
    nextRange.forEach((date: Date) => {
      expect(date.getHours()).toBe(0);
      expect(date.getMinutes()).toBe(0);
    });
  });

  it('renders the calendar view when defaultOpen is true', () => {
    // Arrange & Act
    const testRenderer = renderCalendarPicker({
      defaultValue: BASE_DATE,
      defaultOpen: true,
    });

    // Assert
    expect(testRenderer.root.findByType(CalendarPickerView)).toBeTruthy();
  });

  it('reports date changes without confirming', () => {
    // Arrange
    const onChange = jest.fn();
    const onOk = jest.fn();
    const testRenderer = renderCalendarPicker({
      defaultValue: BASE_DATE,
      defaultOpen: true,
      onChange,
      onOk,
    });

    // Act
    pressByTestID(testRenderer, 'calendar-cell-2026-10-20');

    // Assert
    expect(onChange).toHaveBeenCalledTimes(1);
    const [nextDate, params] = onChange.mock.calls[0];
    expect(nextDate).toBeInstanceOf(Date);
    expect(nextDate.getFullYear()).toBe(2026);
    expect(nextDate.getMonth()).toBe(9);
    expect(nextDate.getDate()).toBe(20);
    expect(params.date).toBe(nextDate);
    expect(params.year).toBe(2026);
    expect(params.month).toBe(10);
    expect(params.day).toBe(20);
    expect(onOk).not.toHaveBeenCalled();
  });

  it('confirms the draft value and closes the popup', () => {
    // Arrange
    const onOk = jest.fn();
    const onOpenChange = jest.fn();
    const testRenderer = renderCalendarPicker({
      defaultValue: BASE_DATE,
      defaultOpen: true,
      onOk,
      onOpenChange,
    });

    // Act
    pressByTestID(testRenderer, 'calendar-cell-2026-10-20');
    pressByTestID(testRenderer, 'picker-ok-button');

    // Assert
    expect(onOk).toHaveBeenCalledTimes(1);
    const [nextDate, params] = onOk.mock.calls[0];
    expect(nextDate).toBeInstanceOf(Date);
    expect(nextDate.getFullYear()).toBe(2026);
    expect(nextDate.getMonth()).toBe(9);
    expect(nextDate.getDate()).toBe(20);
    expect(params.day).toBe(20);
    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: 'ok' });
    expect(
      testRenderer.root.findAllByProps({ testID: 'calendar-cell-2026-10-20' }),
    ).toHaveLength(0);
  });

  it('keeps the original value on the trigger after cancel', () => {
    // Arrange
    const onCancel = jest.fn();
    const testRenderer = renderCalendarPicker({
      defaultValue: BASE_DATE,
      defaultOpen: true,
      onCancel,
    });

    // Act
    pressByTestID(testRenderer, 'calendar-cell-2026-10-20');
    pressByTestID(testRenderer, 'picker-cancel-button');

    // Assert
    expect(onCancel).toHaveBeenCalledWith({ reason: 'cancel' });
    expect(triggerValueText(testRenderer)).toBe('2026-10-25');
  });

  it('returns month precision dates from month panel cells', () => {
    // Arrange
    const onChange = jest.fn();
    const testRenderer = renderCalendarPicker({
      defaultValue: makeDate(2026, 5, 7),
      defaultOpen: true,
      onChange,
      precision: 'month',
    });

    // Act
    pressByTestID(testRenderer, 'calendar-cell-2026-08');

    // Assert
    const [nextDate, params] = onChange.mock.calls[0];
    expect(nextDate.getFullYear()).toBe(2026);
    expect(nextDate.getMonth()).toBe(7);
    expect(nextDate.getDate()).toBe(7);
    expect(params.month).toBe(8);
  });

  it('returns year precision dates from year panel cells', () => {
    // Arrange
    const onChange = jest.fn();
    const testRenderer = renderCalendarPicker({
      defaultValue: makeDate(2026, 5, 7),
      defaultOpen: true,
      onChange,
      precision: 'year',
    });

    // Act
    pressByTestID(testRenderer, 'calendar-cell-2027');

    // Assert
    const [nextDate, params] = onChange.mock.calls[0];
    expect(nextDate.getFullYear()).toBe(2027);
    expect(nextDate.getMonth()).toBe(4);
    expect(nextDate.getDate()).toBe(7);
    expect(params.year).toBe(2027);
  });

  it('respects disabledDate and renders date marks', () => {
    // Arrange
    const onChange = jest.fn();
    const testRenderer = renderCalendarPicker({
      defaultValue: BASE_DATE,
      defaultOpen: true,
      disabledDate: date => date.getDate() === 12,
      marks: [{ date: makeDate(2026, 10, 15), content: 'mark' }],
      onChange,
    });

    // Act
    const disabledCell = testRenderer.root.findByProps({
      testID: 'calendar-cell-2026-10-12',
    });
    act(() => {
      disabledCell.props.onPress({});
    });

    // Assert
    expect(disabledCell.props.disabled).toBe(true);
    expect(onChange).not.toHaveBeenCalled();
    expect(
      testRenderer.root.findByProps({ testID: 'calendar-mark-2026-10-15' }),
    ).toBeTruthy();
  });

  it('commits the selected range after confirmation', () => {
    // Arrange
    const onOk = jest.fn();
    const testRenderer = renderCalendarPickerRange({
      defaultValue: [makeDate(2026, 10, 25), makeDate(2026, 10, 28)],
      defaultOpen: true,
      onOk,
    });

    // Act
    pressByTestID(testRenderer, 'calendar-cell-2026-10-20');
    pressByTestID(testRenderer, 'calendar-cell-2026-10-22');
    pressByTestID(testRenderer, 'picker-ok-button');

    // Assert
    expect(onOk).toHaveBeenCalledTimes(1);
    const [nextRange] = onOk.mock.calls[0];
    expect(nextRange).toHaveLength(2);
    expect(nextRange[0]).toBeInstanceOf(Date);
    expect(nextRange[1]).toBeInstanceOf(Date);
    expect(nextRange[0].getDate()).toBe(20);
    expect(nextRange[1].getDate()).toBe(22);
    expect(triggerValueText(testRenderer)).toBe('2026-10-20 - 2026-10-22');
  });

  it('drops the range draft when cancelled', () => {
    // Arrange
    const onCancel = jest.fn();
    const onOk = jest.fn();
    const testRenderer = renderCalendarPickerRange({
      defaultValue: [makeDate(2026, 10, 25), makeDate(2026, 10, 28)],
      defaultOpen: true,
      onCancel,
      onOk,
    });

    // Act
    pressByTestID(testRenderer, 'calendar-cell-2026-10-20');
    pressByTestID(testRenderer, 'calendar-cell-2026-10-22');
    pressByTestID(testRenderer, 'picker-cancel-button');

    // Assert
    expect(onCancel).toHaveBeenCalledWith({ reason: 'cancel' });
    expect(onOk).not.toHaveBeenCalled();
    expect(triggerValueText(testRenderer)).toBe('2026-10-25 - 2026-10-28');
  });

  it('does not open the popup when readonly', () => {
    // Arrange
    const onOpenChange = jest.fn();
    const testRenderer = renderCalendarPicker({
      defaultValue: BASE_DATE,
      readonly: true,
      onOpenChange,
    });

    // Act
    act(() => {
      testRenderer.root.findByType(DisplayInput).props.onPress();
    });

    // Assert
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('renders placeholder without a label and hides it when a label exists', () => {
    const emptyRenderer = renderCalendarPicker({ placeholder: '请选择日期' });
    const labeledRenderer = renderCalendarPicker({
      labelText: '日期',
      placeholder: '请选择日期',
    });

    expect(JSON.stringify(emptyRenderer.toJSON())).toContain('请选择日期');
    expect(JSON.stringify(labeledRenderer.toJSON())).not.toContain('请选择日期');
  });
});
