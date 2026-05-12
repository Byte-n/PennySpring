import React from 'react';
import renderer, { act } from 'react-test-renderer';

jest.mock('@react-navigation/material-top-tabs', () => ({
  createMaterialTopTabNavigator: () => ({
    Navigator: 'Navigator',
    Screen: 'Screen',
  }),
}));

jest.mock('react-native-gesture-handler', () => {
  const ReactNative = require('react-native');

  return {
    GestureHandlerRootView: ReactNative.View,
  };
});

jest.mock('react-native-reanimated', () => {
  const ReactModule = require('react');
  const ReactNative = require('react-native');

  return {
    __esModule: true,
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

import {
  DateTimePicker,
  Text,
  type DateTimePickerLabelParams,
  type DateTimePickerProps,
  type DateTimePickerValueParams,
} from '../src';

function makeDate(year: number, month: number, day: number, hours = 0, minutes = 0, seconds = 0): Date {
  // month is 1-based here
  return new Date(year, month - 1, day, hours, minutes, seconds, 0);
}

it('builds year/month/day/hour/minute columns at default precision', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <DateTimePicker
        defaultOpen
        value={makeDate(2026, 5, 9, 10, 30)}
        min={makeDate(2024, 1, 1)}
        max={makeDate(2028, 12, 31)}
      />,
    );
  });

  // year, month, day, hour, minute → 5 columns
  expect(testRenderer!.root.findByProps({ testID: 'picker-item-0-0' })).toBeTruthy();
  expect(testRenderer!.root.findByProps({ testID: 'picker-item-1-0' })).toBeTruthy();
  expect(testRenderer!.root.findByProps({ testID: 'picker-item-2-0' })).toBeTruthy();
  expect(testRenderer!.root.findByProps({ testID: 'picker-item-3-0' })).toBeTruthy();
  expect(testRenderer!.root.findByProps({ testID: 'picker-item-4-0' })).toBeTruthy();
  // No seconds column
  expect(() =>
    testRenderer!.root.findByProps({ testID: 'picker-item-5-0' }),
  ).toThrow();
});

it('limits precision to year only', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <DateTimePicker
        defaultOpen
        precision="year"
        value={makeDate(2026, 5, 9)}
        min={makeDate(2024, 1, 1)}
        max={makeDate(2028, 12, 31)}
      />,
    );
  });

  expect(testRenderer!.root.findByProps({ testID: 'picker-item-0-0' })).toBeTruthy();
  expect(() =>
    testRenderer!.root.findByProps({ testID: 'picker-item-1-0' }),
  ).toThrow();
});

it('uses month/day columns correctly with 1-based month', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <DateTimePicker
        defaultOpen
        precision="day"
        value={makeDate(2026, 5, 9)}
        min={makeDate(2024, 1, 1)}
        max={makeDate(2028, 12, 31)}
      />,
    );
  });

  // Month column: 1..12 → 12 items, itemIndex 0..11
  expect(testRenderer!.root.findByProps({ testID: 'picker-item-1-11' })).toBeTruthy();
  expect(() =>
    testRenderer!.root.findByProps({ testID: 'picker-item-1-12' }),
  ).toThrow();
  // Selected month is 5 → itemIndex 4
  expect(
    testRenderer!.root.findByProps({ testID: 'picker-item-1-4' }).props.selected,
  ).toBe(true);
});

it('generates day column based on current year/month (leap year Feb)', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <DateTimePicker
        defaultOpen
        precision="day"
        value={makeDate(2024, 2, 15)}
        min={makeDate(2020, 1, 1)}
        max={makeDate(2030, 12, 31)}
      />,
    );
  });

  // Feb 2024 → 29 days
  expect(testRenderer!.root.findByProps({ testID: 'picker-item-2-28' })).toBeTruthy();
  expect(() =>
    testRenderer!.root.findByProps({ testID: 'picker-item-2-29' }),
  ).toThrow();
});

it('generates day column for non-leap year Feb with 28 days', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <DateTimePicker
        defaultOpen
        precision="day"
        value={makeDate(2025, 2, 15)}
        min={makeDate(2020, 1, 1)}
        max={makeDate(2030, 12, 31)}
      />,
    );
  });

  expect(testRenderer!.root.findByProps({ testID: 'picker-item-2-27' })).toBeTruthy();
  expect(() =>
    testRenderer!.root.findByProps({ testID: 'picker-item-2-28' }),
  ).toThrow();
});

it('uses year range from min/max', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <DateTimePicker
        defaultOpen
        precision="year"
        value={makeDate(2025, 1, 1)}
        min={makeDate(2024, 1, 1)}
        max={makeDate(2026, 12, 31)}
      />,
    );
  });

  // Years 2024, 2025, 2026 → 3 items
  expect(testRenderer!.root.findByProps({ testID: 'picker-item-0-2' })).toBeTruthy();
  expect(() =>
    testRenderer!.root.findByProps({ testID: 'picker-item-0-3' }),
  ).toThrow();
});

it('translates picker change into Date in onChange', () => {
  const onChange = jest.fn();
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <DateTimePicker
        defaultOpen
        value={makeDate(2026, 5, 9, 10, 30)}
        min={makeDate(2024, 1, 1)}
        max={makeDate(2028, 12, 31)}
        onChange={onChange}
      />,
    );
  });

  // Click minute item at index 45 (column 4)
  act(() => {
    testRenderer!.root.findByProps({ testID: 'picker-item-4-45' }).props.onPress();
  });

  expect(onChange).toHaveBeenCalledTimes(1);
  const [nextDate, params] = onChange.mock.calls[0];
  expect(nextDate.getFullYear()).toBe(2026);
  expect(nextDate.getMonth()).toBe(4); // May → index 4
  expect(nextDate.getDate()).toBe(9);
  expect(nextDate.getHours()).toBe(10);
  expect(nextDate.getMinutes()).toBe(45);
  expect(params.year).toBe(2026);
  expect(params.month).toBe(5);
  expect(params.day).toBe(9);
  expect(params.minutes).toBe(45);
});

it('calls onOk with commited date', () => {
  const onOk = jest.fn();
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <DateTimePicker
        defaultOpen
        defaultValue={makeDate(2026, 5, 9, 10, 30)}
        min={makeDate(2024, 1, 1)}
        max={makeDate(2028, 12, 31)}
        onOk={onOk}
      />,
    );
  });

  act(() => {
    testRenderer!.root.findByProps({ testID: 'picker-item-3-11' }).props.onPress();
  });
  act(() => {
    testRenderer!.root.findByProps({ testID: 'picker-ok-button' }).props.onPress();
  });

  expect(onOk).toHaveBeenCalledTimes(1);
  const [nextDate, params] = onOk.mock.calls[0];
  expect(nextDate.getHours()).toBe(11);
  expect(params.hours).toBe(11);
});

it('passes through onCancel and onOpenChange', () => {
  const onCancel = jest.fn();
  const onOpenChange = jest.fn();
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <DateTimePicker
        defaultOpen
        value={makeDate(2026, 5, 9, 10, 30)}
        min={makeDate(2024, 1, 1)}
        max={makeDate(2028, 12, 31)}
        onCancel={onCancel}
        onOpenChange={onOpenChange}
      />,
    );
  });

  act(() => {
    testRenderer!.root.findByProps({ testID: 'picker-cancel-button' }).props.onPress();
  });

  expect(onCancel).toHaveBeenCalledWith({ reason: 'cancel' });
  expect(onOpenChange).toHaveBeenCalledWith(false, { reason: 'cancel' });
});

it('uses formatLabel to override text', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <DateTimePicker
        defaultOpen
        precision="day"
        value={makeDate(2026, 5, 9)}
        min={makeDate(2024, 1, 1)}
        max={makeDate(2028, 12, 31)}
        formatLabel={(value, params) => {
          if (params.type === 'month' || params.type === 'day') {
            return String(value).padStart(2, '0');
          }
          return String(value);
        }}
      />,
    );
  });

  const tree = JSON.stringify(testRenderer!.toJSON());
  expect(tree).toContain('2026');
  expect(tree).toContain('05');
  expect(tree).toContain('09');
});

it('uses renderLabel to render custom nodes', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <DateTimePicker
        defaultOpen
        precision="year"
        value={makeDate(2026, 5, 9)}
        min={makeDate(2025, 1, 1)}
        max={makeDate(2026, 12, 31)}
        renderLabel={params => <Text>{`y-${params.value}`}</Text>}
      />,
    );
  });

  const tree = JSON.stringify(testRenderer!.toJSON());
  expect(tree).toContain('y-2025');
  expect(tree).toContain('y-2026');
});

it('uses minuteStep when building minute column', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <DateTimePicker
        defaultOpen
        minuteStep={15}
        value={makeDate(2026, 5, 9, 10, 0)}
        min={makeDate(2024, 1, 1)}
        max={makeDate(2028, 12, 31)}
      />,
    );
  });

  // 4 minute items at column 4 (year, month, day, hour, minute)
  expect(testRenderer!.root.findByProps({ testID: 'picker-item-4-3' })).toBeTruthy();
  expect(() =>
    testRenderer!.root.findByProps({ testID: 'picker-item-4-4' }),
  ).toThrow();
});
