import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Calendar } from '../src/Calendar';
import { Text } from '../src/Text';

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
    // Arrange
    const onChange = jest.fn();
    const testRenderer = renderCalendar({
      defaultValue: '2026-05-01',
      marks: [{
        date: '2026-05-07',
        content: 'dot'
      }],
      onChange
    });

    // Act
    pressByTestID(testRenderer, 'calendar-cell-2026-05-07');

    // Assert
    expect(onChange).toHaveBeenCalledWith('2026-05-07');
    expect(textOf(testRenderer)).toContain('2026-05-07');
    expect(textOf(testRenderer)).toContain('dot');
  });

  it('keeps controlled month display while reporting changes', () => {
    // Arrange
    const onChange = jest.fn();
    const testRenderer = renderCalendar({
      mode: 'month',
      onChange,
      value: '2026-05'
    });

    // Act
    pressByTestID(testRenderer, 'calendar-cell-2026-06');

    // Assert
    expect(onChange).toHaveBeenCalledWith('2026-06');
    expect(textOf(testRenderer)).toContain('2026-05');
  });

  it('blocks disabled dates', () => {
    // Arrange
    const onChange = jest.fn();
    const testRenderer = renderCalendar({
      defaultValue: '2026-05-01',
      disabledDate: value => value === '2026-05-07',
      onChange
    });

    // Act
    const disabledCell = testRenderer.root.findByProps({ testID: 'calendar-cell-2026-05-07' });
    act(() => {
      disabledCell.props.onPress({});
    });

    // Assert
    expect(disabledCell.props.disabled).toBe(true);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('delays single value submission in confirm mode', () => {
    // Arrange
    const onChange = jest.fn();
    const onOk = jest.fn();
    const testRenderer = renderCalendar({
      defaultValue: '2026-05-01',
      onChange,
      onOk,
      showConfirm: true
    });

    // Act
    pressByTestID(testRenderer, 'calendar-cell-2026-05-07');
    pressByTestID(testRenderer, 'calendar-confirm');

    // Assert
    expect(onChange).toHaveBeenCalledWith('2026-05-07');
    expect(onOk).toHaveBeenCalledWith('2026-05-07');
  });

  it('normalizes range values after complete selection', () => {
    // Arrange
    const onChange = jest.fn();
    const testRenderer = renderCalendarRange({
      mode: 'month',
      onChange,
      value: ['2026-05', '2026-05']
    });

    // Act
    pressByTestID(testRenderer, 'calendar-cell-2026-08');
    pressByTestID(testRenderer, 'calendar-cell-2026-06');

    // Assert
    expect(onChange).toHaveBeenCalledWith(['2026-06', '2026-08']);
  });

  it('exposes cell as pressable and navigation buttons', () => {
    // Arrange
    const testRenderer = renderCalendar({
      value: '2026-05-07'
    });

    // Act
    const selectedCell = testRenderer.root.findByProps({ testID: 'calendar-cell-2026-05-07' });
    const navigationButton = testRenderer.root.findByProps({ testID: 'calendar-nav-prev' });

    // Assert
    expect(selectedCell.props.onPress).toBeDefined();
    expect(navigationButton.props.onPress).toBeDefined();
  });

  it('prevents range today action when today is disabled by disabledDate', () => {
    // Arrange
    jest.useFakeTimers().setSystemTime(new Date('2026-05-15T00:00:00.000Z'));
    const onChange = jest.fn();
    const testRenderer = renderCalendarRange({
      onChange,
      showToday: true,
      disabledDate: value => value === '2026-05-15'
    });

    // Act
    const todayButton = testRenderer.root.findAll(node => typeof node.props.hitSlop === 'number')[0];
    act(() => {
      todayButton.props.onPress({});
    });
    pressByTestID(testRenderer, 'calendar-cell-2026-05-16');

    // Assert
    expect(onChange).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('disables navigation and footer actions when calendar is disabled', () => {
    // Arrange
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

    // Act
    const prevButton = testRenderer.root.findByProps({ testID: 'calendar-nav-prev' });
    const nextButton = testRenderer.root.findByProps({ testID: 'calendar-nav-next' });
    const confirmButton = testRenderer.root.findByProps({ testID: 'calendar-confirm' });

    // Assert
    expect(prevButton.props.disabled).toBe(true);
    expect(nextButton.props.disabled).toBe(true);
    expect(confirmButton.props.disabled).toBe(true);
    expect(textOf(testRenderer)).toContain('calendar-nav-prev');
    expect(onCancel).not.toHaveBeenCalled();
    expect(onOk).not.toHaveBeenCalled();
  });

  it('uses text color props for title week and date labels', () => {
    // Arrange
    const testRenderer = renderCalendar({ defaultValue: '2026-05-07' });

    // Act
    const textNodes = testRenderer.root.findAllByType(Text);

    // Assert
    expect(textNodes.some(node => node.props.color === 'heading')).toBe(true);
    expect(textNodes.some(node => node.props.color === 'tertiary')).toBe(true);
    expect(textNodes.some(node => node.props.color === 'default')).toBe(true);
  });

  it('uses token-driven hitSlop instead of hardcoded value for footer actions', () => {
    // Arrange
    const testRenderer = renderCalendar({
      defaultValue: '2026-05-07',
      showToday: true,
      showConfirm: true,
    });

    // Act
    const actionButtons = testRenderer.root.findAll(node => typeof node.props.hitSlop === 'number');

    // Assert
    expect(actionButtons.length).toBeGreaterThanOrEqual(3);
    expect(actionButtons.some(node => node.props.hitSlop === 8)).toBe(false);
  });

  it('uses semantic flex basis values for calendar cells', () => {
    // Arrange
    const dateRenderer = renderCalendar({ defaultValue: '2026-05-07' });
    const monthRenderer = renderCalendar({ mode: 'month', defaultValue: '2026-05' });
    const yearRenderer = renderCalendar({ mode: 'year', defaultValue: '2026' });

    // Act
    const dateCell = dateRenderer.root.findByProps({ testID: 'calendar-cell-2026-05-07' });
    const monthCell = monthRenderer.root.findByProps({ testID: 'calendar-cell-2026-05' });
    const yearCell = yearRenderer.root.findByProps({ testID: 'calendar-cell-2026' });

    // Assert
    expect(JSON.stringify(dateCell.props.style)).toContain('flexBasis');
    expect(JSON.stringify(monthCell.props.style)).toContain('flexBasis');
    expect(JSON.stringify(yearCell.props.style)).toContain('flexBasis');
    expect(JSON.stringify(dateCell.props.style)).not.toContain('14.2857%');
    expect(JSON.stringify(monthCell.props.style)).not.toContain('33.3333%');
  });
});
