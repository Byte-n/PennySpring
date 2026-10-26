import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { CalendarPickerView, DateTimePicker } from '../src';
import { DisplayInput } from '../src/DisplayInput';

jest.mock('react-native-gesture-handler', () => {
  const ReactModule = require('react');
  const ReactNative = require('react-native');
  const gesture = {
    onBegin: () => gesture,
    onUpdate: () => gesture,
    runOnJS: () => gesture,
  };

  return {
    Gesture: {
      Pan: () => gesture,
    },
    GestureDetector: ({ children }: { children: React.ReactNode }) =>
      ReactModule.createElement(ReactModule.Fragment, null, children),
    GestureHandlerRootView: ReactNative.View,
  };
});

jest.mock('react-native-reanimated', () => {
  const ReactModule = require('react');
  const ReactNative = require('react-native');

  return {
    __esModule: true,
    Easing: {
      bezier: (...args: number[]) => args,
    },
    default: {
      View: ReactNative.View,
    },
    createAnimatedComponent: (Component: React.ComponentType<Record<string, unknown>>) =>
      (props: Record<string, unknown>) => ReactModule.createElement(Component, props),
    interpolate: (value: number) => value,
    useAnimatedStyle: (updater: () => Record<string, unknown>) => updater(),
    useSharedValue: (value: number) => ({ value }),
    withTiming: (value: number) => value,
  };
});

function makeDate(
  year: number,
  month: number,
  day: number,
  hours = 0,
  minutes = 0,
  seconds = 0,
): Date {
  return new Date(year, month - 1, day, hours, minutes, seconds, 0);
}

it('renders a calendar sheet when layout is calendar', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <DateTimePicker
        defaultOpen
        layout="calendar"
        precision="day"
        value={makeDate(2026, 10, 25)}
      />,
    );
  });

  expect(testRenderer!.root.findByType(CalendarPickerView)).toBeTruthy();
});

it('renders the time entry only when precision includes time', () => {
  let dateRenderer: renderer.ReactTestRenderer;
  let dateTimeRenderer: renderer.ReactTestRenderer;

  act(() => {
    dateRenderer = renderer.create(
      <DateTimePicker
        defaultOpen
        layout="calendar"
        precision="day"
        value={makeDate(2026, 10, 25, 14, 30)}
      />,
    );
    dateTimeRenderer = renderer.create(
      <DateTimePicker
        defaultOpen
        layout="calendar"
        precision="minute"
        value={makeDate(2026, 10, 25, 14, 30)}
      />,
    );
  });

  expect(
    dateRenderer!.root.findAllByProps({ testID: 'date-time-calendar-entry' }),
  ).toHaveLength(0);
  expect(
    dateTimeRenderer!.root.findByProps({ testID: 'date-time-calendar-entry' }),
  ).toBeTruthy();
});

it('shows the current time in the entry for minute precision', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <DateTimePicker
        defaultOpen
        layout="calendar"
        precision="minute"
        value={makeDate(2026, 10, 25, 14, 30)}
      />,
    );
  });

  expect(
    testRenderer!.root.findByProps({ testID: 'date-time-calendar-entry-label' })
      .props.children,
  ).toBe('时间');
  expect(
    testRenderer!.root.findByProps({ testID: 'date-time-calendar-entry-value' })
      .props.children,
  ).toBe('14:30');
});

it('shows seconds in the entry for second precision', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <DateTimePicker
        defaultOpen
        layout="calendar"
        precision="second"
        value={makeDate(2026, 10, 25, 14, 30, 15)}
      />,
    );
  });

  expect(
    testRenderer!.root.findByProps({ testID: 'date-time-calendar-entry-value' })
      .props.children,
  ).toBe('14:30:15');
});

it('switches the entry to the date after flipping to the time wheels', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <DateTimePicker
        defaultOpen
        layout="calendar"
        precision="minute"
        value={makeDate(2026, 10, 25, 14, 30)}
      />,
    );
  });

  act(() => {
    testRenderer!.root
      .findByProps({ testID: 'date-time-calendar-entry' })
      .props.onPress();
  });

  expect(
    testRenderer!.root.findByProps({ testID: 'date-time-calendar-entry-label' })
      .props.children,
  ).toBe('日期');
  expect(
    testRenderer!.root.findByProps({ testID: 'date-time-calendar-entry-value' })
      .props.children,
  ).toContain('10月25日');
});

it('commits the selected date while keeping the current time', () => {
  const onOk = jest.fn();
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <DateTimePicker
        defaultOpen
        layout="calendar"
        precision="minute"
        value={makeDate(2026, 10, 25, 14, 30)}
        onOk={onOk}
      />,
    );
  });

  act(() => {
    testRenderer!.root
      .findByProps({ testID: 'calendar-cell-2026-10-20' })
      .props.onPress();
  });

  act(() => {
    testRenderer!.root
      .findByProps({ testID: 'picker-ok-button' })
      .props.onPress();
  });

  expect(onOk).toHaveBeenCalledWith(
    expect.any(Date),
    expect.objectContaining({
      year: 2026,
      month: 10,
      day: 20,
      hours: 14,
      minutes: 30,
    }),
  );
});

it('commits a time selected from the wheel group', () => {
  const onOk = jest.fn();
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <DateTimePicker
        defaultOpen
        layout="calendar"
        precision="minute"
        value={makeDate(2026, 10, 25, 14, 30)}
        onOk={onOk}
      />,
    );
  });

  act(() => {
    testRenderer!.root
      .findByProps({ testID: 'date-time-calendar-entry' })
      .props.onPress();
  });

  act(() => {
    testRenderer!.root
      .findByProps({ testID: 'date-time-calendar-wheel-column-scroll-1' })
      .props.onMomentumScrollEnd({
        nativeEvent: {
          contentOffset: { x: 0, y: 45 * 44 },
        },
      });
  });

  act(() => {
    testRenderer!.root
      .findByProps({ testID: 'picker-ok-button' })
      .props.onPress();
  });

  expect(onOk).toHaveBeenCalledWith(
    expect.any(Date),
    expect.objectContaining({
      year: 2026,
      month: 10,
      day: 25,
      hours: 14,
      minutes: 45,
    }),
  );
});

it('cancels without committing when the mask is pressed', () => {
  const onOk = jest.fn();
  const onCancel = jest.fn();
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <DateTimePicker
        defaultOpen
        layout="calendar"
        precision="minute"
        value={makeDate(2026, 10, 25, 14, 30)}
        onCancel={onCancel}
        onOk={onOk}
      />,
    );
  });

  act(() => {
    testRenderer!.root.findByProps({ testID: 'popup-mask' }).props.onPress();
  });

  expect(onCancel).toHaveBeenCalledWith({ reason: 'mask' });
  expect(onOk).not.toHaveBeenCalled();
});

it('keeps the committed value on the trigger when cancelled', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <DateTimePicker
        defaultOpen
        layout="calendar"
        precision="minute"
        value={makeDate(2026, 10, 25, 14, 30)}
      />,
    );
  });

  act(() => {
    testRenderer!.root
      .findByProps({ testID: 'calendar-cell-2026-10-20' })
      .props.onPress();
  });

  act(() => {
    testRenderer!.root
      .findByProps({ testID: 'picker-cancel-button' })
      .props.onPress();
  });

  expect(
    testRenderer!.root.findByType(DisplayInput).props.valueText,
  ).toBe('2026-10-25 14:30');
});

it('disables ok when the selected time is outside the allowed range', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <DateTimePicker
        defaultOpen
        layout="calendar"
        min={makeDate(2026, 10, 25, 15, 0)}
        precision="minute"
        value={makeDate(2026, 10, 25, 14, 30)}
      />,
    );
  });

  expect(
    testRenderer!.root.findByProps({ testID: 'picker-ok-button' }).props.disabled,
  ).toBe(true);
});
