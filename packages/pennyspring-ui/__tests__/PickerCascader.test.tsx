import React from 'react';
import renderer, { act } from 'react-test-renderer';
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
    __esModule: true,
    Gesture: {
      Pan: () => gesture,
    },
    GestureDetector: ({ children }: { children: React.ReactNode }) =>
      ReactModule.createElement(ReactModule.Fragment, null, children),
    GestureHandlerRootView: ({ children }: { children?: React.ReactNode }) => (
      <ReactNative.View>{children}</ReactNative.View>
    ),
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

import {
  Picker,
  Tabs,
  Text,
  type PickerCascaderTab,
} from '../src';

interface RegionData {
  code: string;
}

const tabs: Array<PickerCascaderTab<RegionData, 'daily' | 'fixed'>> = [
  {
    tabKey: 'daily',
    labelText: 'Daily',
    options: [
      {
        labelText: 'Food',
        value: 'food',
        data: { code: 'daily-food' },
        children: [
          { labelText: 'Breakfast', value: 'breakfast', data: { code: 'daily-breakfast' } },
          { labelText: 'Dinner', value: 'dinner', data: { code: 'daily-dinner' } },
        ],
      },
      {
        labelText: 'Traffic',
        value: 'traffic',
        data: { code: 'daily-traffic' },
        children: [
          { labelText: 'Metro', value: 'metro', data: { code: 'daily-metro' } },
          { labelText: 'Taxi', value: 'taxi', data: { code: 'daily-taxi' } },
        ],
      },
    ],
  },
  {
    tabKey: 'fixed',
    labelText: 'Fixed',
    options: [
      {
        labelText: 'Home',
        value: 'home',
        data: { code: 'fixed-home' },
        children: [
          { labelText: 'Rent', value: 'rent', data: { code: 'fixed-rent' } },
          { labelText: 'Utilities', value: 'utilities', data: { code: 'fixed-utilities' } },
        ],
      },
    ],
  },
];

it('builds columns for the active tab value path', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker.Cascader
        defaultOpen
        tabs={tabs}
        value={{
          daily: ['traffic', 'metro'],
          fixed: ['home', 'rent'],
        }}
      />,
    );
  });

  const tree = JSON.stringify(testRenderer!.toJSON());
  expect(tree).toContain('Daily');
  expect(tree).toContain('Traffic');
  expect(tree).toContain('Metro');

  expect(
    testRenderer!.root.findByProps({ testID: 'picker-item-0-1' }).props.selected,
  ).toBe(true);
  expect(
    testRenderer!.root.findByProps({ testID: 'picker-item-1-0' }).props.selected,
  ).toBe(true);
});

it('switches between tabs and keeps each tab value independent', () => {
  const onChange = jest.fn();
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker.Cascader
        defaultOpen
        onChange={onChange}
        tabs={tabs}
        value={{
          daily: ['traffic', 'metro'],
          fixed: ['home', 'rent'],
        }}
      />,
    );
  });

  act(() => {
    testRenderer!.root.findByProps({ testID: 'tabs-item-fixed' }).props.onPress();
  });

  const tabsComponent = testRenderer!.root.findByType(Tabs);
  expect(tabsComponent.props.value).toBe('fixed');

  const tree = JSON.stringify(testRenderer!.toJSON());
  expect(tree).toContain('Home');
  expect(tree).toContain('Rent');

  act(() => {
    testRenderer!.root.findByProps({ testID: 'picker-item-1-1' }).props.onPress();
  });

  expect(onChange).toHaveBeenCalledTimes(1);
  const [nextValue, params] = onChange.mock.calls[0];
  expect(nextValue).toEqual({
    daily: ['traffic', 'metro'],
    fixed: ['home', 'utilities'],
  });
  expect(params.tabKey).toBe('fixed');
  expect(params.tabIndex).toBe(1);
  expect(params.path.map((it: PickerCascaderTab<RegionData>['options'][number]) => it.value)).toEqual([
    'home',
    'utilities',
  ]);
});

it('updates only the active tab when a picker column changes', () => {
  const onChange = jest.fn();
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker.Cascader
        defaultOpen
        onChange={onChange}
        tabs={tabs}
        value={{
          daily: ['traffic', 'metro'],
          fixed: ['home', 'rent'],
        }}
      />,
    );
  });

  act(() => {
    testRenderer!.root.findByProps({ testID: 'picker-item-0-0' }).props.onPress();
  });

  expect(onChange).toHaveBeenCalledTimes(1);
  const [nextValue, params] = onChange.mock.calls[0];
  expect(nextValue).toEqual({
    daily: ['food', 'breakfast'],
    fixed: ['home', 'rent'],
  });
  expect(params.tabKey).toBe('daily');
  expect(params.tabIndex).toBe(0);
  expect(params.columnIndex).toBe(0);
  expect(params.items.map((it: PickerCascaderTab<RegionData>['options'][number] | undefined) => it?.value)).toEqual([
    'food',
    'breakfast',
  ]);
});

it('calls onOk with the full record and current tab details', () => {
  const onOk = jest.fn();
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker.Cascader
        defaultOpen
        onOk={onOk}
        tabs={tabs}
        value={{
          daily: ['traffic', 'metro'],
          fixed: ['home', 'rent'],
        }}
      />,
    );
  });

  act(() => {
    testRenderer!.root.findByProps({ testID: 'picker-ok-button' }).props.onPress();
  });

  expect(onOk).toHaveBeenCalledTimes(1);
  const [okValue, okParams] = onOk.mock.calls[0];
  expect(okValue).toEqual({
    daily: ['traffic', 'metro'],
    fixed: ['home', 'rent'],
  });
  expect(okParams.tabKey).toBe('daily');
  expect(okParams.tabIndex).toBe(0);
  expect(okParams.path.map((it: PickerCascaderTab<RegionData>['options'][number]) => it.value)).toEqual([
    'traffic',
    'metro',
  ]);
});

it('passes through onCancel and onOpenChange', () => {
  const onCancel = jest.fn();
  const onOpenChange = jest.fn();
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker.Cascader
        defaultOpen
        onCancel={onCancel}
        onOpenChange={onOpenChange}
        tabs={tabs}
        value={{
          daily: ['traffic', 'metro'],
          fixed: ['home', 'rent'],
        }}
      />,
    );
  });

  act(() => {
    testRenderer!.root.findByProps({ testID: 'picker-cancel-button' }).props.onPress();
  });

  expect(onCancel).toHaveBeenCalledWith({ reason: 'cancel' });
  expect(onOpenChange).toHaveBeenCalledWith(false, { reason: 'cancel' });
});

it('renders tabs between the header and picker body', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker.Cascader defaultOpen tabs={tabs} titleText="Category" />,
    );
  });

  const tabsComponent = testRenderer!.root.findByType(Tabs);
  expect(tabsComponent.props.value).toBe('daily');

  const tree = JSON.stringify(testRenderer!.toJSON());
  expect(tree).toContain('Category');
  expect(tree).toContain('Daily');
  expect(tree).toContain('Fixed');
});

it('uses renderLabel with the original option from the active tab', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker.Cascader<RegionData, 'daily' | 'fixed'>
        defaultOpen
        renderLabel={option => <Text>{`node-${option.data?.code ?? 'x'}`}</Text>}
        tabs={tabs}
        value={{
          daily: ['traffic'],
          fixed: ['home'],
        }}
      />,
    );
  });

  const tree = JSON.stringify(testRenderer!.toJSON());
  expect(tree).toContain('node-daily-traffic');
  expect(tree).toContain('node-daily-metro');
});

it('truncates invalid values within the active tab', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker.Cascader
        defaultOpen
        tabs={tabs}
        value={{
          daily: ['traffic', 'unknown', 'metro'],
          fixed: ['home', 'rent'],
        }}
      />,
    );
  });

  expect(
    testRenderer!.root.findByProps({ testID: 'picker-item-0-1' }).props.selected,
  ).toBe(true);
  expect(
    testRenderer!.root.findByProps({ testID: 'picker-item-1-0' }).props.selected,
  ).toBe(false);
  expect(() =>
    testRenderer!.root.findByProps({ testID: 'picker-item-2-0' }),
  ).toThrow();
});

it('renders empty state when the active tab has no options', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker.Cascader
        defaultOpen
        tabs={[
          {
            tabKey: 'daily',
            labelText: 'Daily',
            options: [],
          },
        ]}
        emptyText="No data"
      />,
    );
  });

  expect(JSON.stringify(testRenderer!.toJSON())).toContain('No data');
});

it('prevents opening when readonly is true', () => {
  const onOpenChange = jest.fn();
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker.Cascader
        onOpenChange={onOpenChange}
        readonly
        tabs={tabs}
      />,
    );
  });

  act(() => {
    const displayInput = testRenderer!.root.findByType(DisplayInput);
    displayInput.props.onPress();
  });

  expect(onOpenChange).not.toHaveBeenCalledWith(true, { reason: 'trigger' });
  expect(() => testRenderer!.root.findByProps({ testID: 'picker-popup-mask' })).toThrow();
});

it('passes size through to the picker body', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker.Cascader defaultOpen size="large" tabs={tabs} />,
    );
  });

  const tree = JSON.stringify(testRenderer!.toJSON());
  expect(tree).toContain('Daily');
  expect(tree).toContain('Food');
});

it('clears the active tab path through the clear button', () => {
  const onChange = jest.fn();
  const onClear = jest.fn();
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker.Cascader
        allowClear
        onChange={onChange}
        onClear={onClear}
        tabs={tabs}
        value={{
          daily: ['traffic', 'metro'],
          fixed: ['home', 'rent'],
        }}
      />,
    );
  });

  act(() => {
    testRenderer!.root
      .findByProps({ testID: 'picker-trigger-clear-button' })
      .props.onPress();
  });

  expect(onClear).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledTimes(1);
  const [nextValue, params] = onChange.mock.calls[0];
  expect(nextValue).toEqual({
    daily: [],
    fixed: ['home', 'rent'],
  });
  expect(params.reason).toBe('clear');
  expect(params.tabKey).toBe('daily');
});
