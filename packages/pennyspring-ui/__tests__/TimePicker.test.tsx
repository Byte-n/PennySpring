import React from 'react';
import renderer, { act } from 'react-test-renderer';

jest.mock('@react-navigation/material-top-tabs', () => ({
  createMaterialTopTabNavigator: () => ({
    Navigator: 'Navigator',
    Screen: 'Screen',
  }),
}));

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
  DisplayInput,
  Picker,
  Text,
  TimePicker,
} from '../src';
import type { TimePickerStyles } from '../src';

function makeDate(hours: number, minutes: number, seconds = 0): Date {
  return new Date(2026, 4, 9, hours, minutes, seconds, 0);
}

it('builds hour and minute columns by default precision', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <TimePicker defaultOpen value={makeDate(10, 30)} />,
    );
  });

  // Hour column: 0..23 → 24 items
  expect(testRenderer!.root.findByProps({ testID: 'picker-item-0-0' }).props)
    .toBeTruthy();
  expect(testRenderer!.root.findByProps({ testID: 'picker-item-0-23' }).props)
    .toBeTruthy();
  // Minute column: 0..59 → 60 items
  expect(testRenderer!.root.findByProps({ testID: 'picker-item-1-59' }).props)
    .toBeTruthy();
  // No second column at default precision
  expect(testRenderer!.root.findAllByProps({ testID: 'picker-item-2-0' }))
    .toHaveLength(0);
});

it('includes second column when precision is second', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <TimePicker defaultOpen precision="second" value={makeDate(9, 15, 20)} />,
    );
  });

  expect(testRenderer!.root.findByProps({ testID: 'picker-item-2-59' }).props)
    .toBeTruthy();
});

it('renders only hour column when precision is hour', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <TimePicker defaultOpen precision="hour" value={makeDate(9, 15)} />,
    );
  });

  expect(testRenderer!.root.findByProps({ testID: 'picker-item-0-23' }).props)
    .toBeTruthy();
  expect(testRenderer!.root.findAllByProps({ testID: 'picker-item-1-0' }))
    .toHaveLength(0);
});

it('selects hour 10 and minute 30 from value prop', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <TimePicker defaultOpen value={makeDate(10, 30)} />,
    );
  });

  expect(
    testRenderer!.root.findByProps({ testID: 'picker-item-0-10' }).props.selected,
  ).toBe(true);
  expect(
    testRenderer!.root.findByProps({ testID: 'picker-item-1-30' }).props.selected,
  ).toBe(true);
});

it('shows selected time in display input trigger', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <TimePicker value={makeDate(10, 30)} />,
    );
  });

  const triggerInput = testRenderer!.root.findByType(DisplayInput);

  expect(triggerInput.props.valueText).toBe('10:30');
});

it('uses formatLabel to override column label text', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <TimePicker
        defaultOpen
        value={makeDate(10, 30)}
        formatLabel={(value, params) => {
          if (params.type === 'hour') {
            return `${String(value).padStart(2, '0')} h`;
          }
          return `${String(value).padStart(2, '0')} m`;
        }}
      />,
    );
  });

  const tree = JSON.stringify(testRenderer!.toJSON());
  expect(tree).toContain('10 h');
  expect(tree).toContain('30 m');
});

it('uses renderLabel to render custom nodes', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <TimePicker
        defaultOpen
        value={makeDate(10, 30)}
        renderLabel={params => <Text>{`custom-${params.type}-${params.value}`}</Text>}
      />,
    );
  });

  const tree = JSON.stringify(testRenderer!.toJSON());
  expect(tree).toContain('custom-hour-10');
  expect(tree).toContain('custom-minute-30');
});

it('translates picker change into Date in onChange', () => {
  const onChange = jest.fn();
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <TimePicker
        defaultOpen
        value={makeDate(10, 30)}
        onChange={onChange}
      />,
    );
  });

  act(() => {
    testRenderer!.root.findByProps({ testID: 'picker-item-1-45' }).props.onPress();
  });

  expect(onChange).toHaveBeenCalledTimes(1);
  const [nextDate, params] = onChange.mock.calls[0];
  expect(nextDate.getHours()).toBe(10);
  expect(nextDate.getMinutes()).toBe(45);
  expect(params.hours).toBe(10);
  expect(params.minutes).toBe(45);
  expect(params.seconds).toBe(0);
  expect(params.date).toBe(nextDate);
});

it('translates picker ok into Date in onOk', () => {
  const onOk = jest.fn();
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <TimePicker
        defaultOpen
        defaultValue={makeDate(10, 30)}
        onOk={onOk}
      />,
    );
  });

  act(() => {
    testRenderer!.root.findByProps({ testID: 'picker-item-0-11' }).props.onPress();
  });
  act(() => {
    testRenderer!.root.findByProps({ testID: 'picker-ok-button' }).props.onPress();
  });

  expect(onOk).toHaveBeenCalledTimes(1);
  const [nextDate, params] = onOk.mock.calls[0];
  expect(nextDate.getHours()).toBe(11);
  expect(nextDate.getMinutes()).toBe(30);
  expect(params.hours).toBe(11);
});

it('passes through onCancel and onOpenChange', () => {
  const onCancel = jest.fn();
  const onOpenChange = jest.fn();
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <TimePicker
        defaultOpen
        value={makeDate(10, 30)}
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

it('disables options outside of min/max range', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <TimePicker
        defaultOpen
        precision="hour"
        value={makeDate(12, 0)}
        min={makeDate(10, 0)}
        max={makeDate(14, 0)}
      />,
    );
  });

  const item9 = testRenderer!.root.findByProps({ testID: 'picker-item-0-9' });
  const item10 = testRenderer!.root.findByProps({ testID: 'picker-item-0-10' });
  const item14 = testRenderer!.root.findByProps({ testID: 'picker-item-0-14' });
  const item15 = testRenderer!.root.findByProps({ testID: 'picker-item-0-15' });

  expect(item9.props.disabled).toBe(true);
  expect(item10.props.disabled).toBeFalsy();
  expect(item14.props.disabled).toBeFalsy();
  expect(item15.props.disabled).toBe(true);
});

it('preserves year/month/day from base date on selection', () => {
  const onOk = jest.fn();
  let testRenderer: renderer.ReactTestRenderer;
  const base = new Date(2024, 7, 15, 10, 30, 0, 0);

  act(() => {
    testRenderer = renderer.create(
      <TimePicker defaultOpen defaultValue={base} onOk={onOk} />,
    );
  });

  act(() => {
    testRenderer!.root.findByProps({ testID: 'picker-item-1-45' }).props.onPress();
  });
  act(() => {
    testRenderer!.root.findByProps({ testID: 'picker-ok-button' }).props.onPress();
  });

  const [nextDate] = onOk.mock.calls[0];
  expect(nextDate.getFullYear()).toBe(2024);
  expect(nextDate.getMonth()).toBe(7);
  expect(nextDate.getDate()).toBe(15);
  expect(nextDate.getMinutes()).toBe(45);
});

describe('placeholder behavior', () => {
  it('shows placeholder instead of current time when no value or defaultValue is provided', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <TimePicker labelText="请选择时间" />,
      );
    });

    const triggerInput = testRenderer!.root.findByType(DisplayInput);
    expect(triggerInput.props.valueText).toBeUndefined();
    expect(triggerInput.props.placeholder).toBe('请选择时间');
  });

  it('shows value text when defaultValue is provided', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <TimePicker defaultValue={makeDate(10, 30)} labelText="请选择时间" />,
      );
    });

    const triggerInput = testRenderer!.root.findByType(DisplayInput);
    expect(triggerInput.props.valueText).toBe('10:30');
  });
});

describe('readonly behavior', () => {
  it('does not open popup when readonly and trigger is pressed', () => {
    const onOpenChange = jest.fn();
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <TimePicker readonly onOpenChange={onOpenChange} />,
      );
    });

    const trigger = testRenderer!.root.findByProps({ testID: 'picker-trigger' });
    act(() => {
      trigger.props.onPress();
    });

    expect(onOpenChange).not.toHaveBeenCalled();
  });
});

describe('size prop', () => {
  it('passes size prop to internal Picker', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <TimePicker size="small" />,
      );
    });

    const picker = testRenderer!.root.findByType(Picker);
    expect(picker.props.size).toBe('small');
  });

  it('defaults to normal size when size is not provided', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <TimePicker />,
      );
    });

    const picker = testRenderer!.root.findByType(Picker);
    expect(picker.props.size).toBe('normal');
  });
});

describe('TimePickerStyles type', () => {
  it('TimePickerStyles type is importable', () => {
    const styles: TimePickerStyles = {
      trigger: {},
    };
    expect(styles).toBeDefined();
  });
});
