import React from 'react';
import renderer, { act } from 'react-test-renderer';

jest.mock('react-native-gesture-handler', () => {
  const ReactNative = require('react-native');

  return {
    __esModule: true,
    GestureHandlerRootView: ({ children }: { children?: React.ReactNode }) => (
      <ReactNative.View>{children}</ReactNative.View>
    ),
  };
});

jest.mock('@react-navigation/material-top-tabs', () => ({
  createMaterialTopTabNavigator: () => ({
    Navigator: 'Navigator',
    Screen: 'Screen',
  }),
}));

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
  Cascader,
  type CascaderOption,
} from '../src/Cascader';

interface RegionData {
  code: string;
}

const options: Array<CascaderOption<RegionData>> = [
  {
    value: 'zhejiang',
    labelText: 'Zhejiang',
    data: { code: 'zj' },
    children: [
      {
        value: 'hangzhou',
        labelText: 'Hangzhou',
        data: { code: 'hz' },
      },
      {
        value: 'ningbo',
        labelText: 'Ningbo',
        data: { code: 'nb' },
      },
    ],
  },
  {
    value: 'guangdong',
    labelText: 'Guangdong',
    data: { code: 'gd' },
    children: [
      {
        value: 'guangzhou',
        labelText: 'Guangzhou',
        data: { code: 'gz' },
      },
    ],
  },
];

describe('Cascader', () => {
  it('renders Cascader.View with tabs and root options', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <Cascader.View options={options} tabPlaceholderText="Select" />,
      );
    });

    const tree = JSON.stringify(testRenderer!.toJSON());

    expect(tree).toContain('Select');
    expect(tree).toContain('Zhejiang');
    expect(tree).toContain('Guangdong');
  });

  it('selects a parent option and switches list to the next level', () => {
    const onChange = jest.fn();
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <Cascader.View options={options} onChange={onChange} />,
      );
    });

    act(() => {
      testRenderer!.root
        .findByProps({ testID: 'cascader-option-0-0' })
        .props.onPress();
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    const [value, params] = onChange.mock.calls[0];
    expect(value).toEqual(['zhejiang']);
    expect(params.level).toBe(0);
    expect(params.optionIndex).toBe(0);
    expect(params.isLeaf).toBe(false);

    const tree = JSON.stringify(testRenderer!.toJSON());
    expect(tree).toContain('Hangzhou');
    expect(tree).toContain('Ningbo');
  });

  it('selects a leaf option and returns full path with isLeaf=true', () => {
    const onChange = jest.fn();
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <Cascader.View
          defaultValue={['zhejiang']}
          options={options}
          onChange={onChange}
        />,
      );
    });

    act(() => {
      testRenderer!.root
        .findByProps({ testID: 'cascader-option-1-0' })
        .props.onPress();
    });

    const [value, params] = onChange.mock.calls[0];
    expect(value).toEqual(['zhejiang', 'hangzhou']);
    expect(params.level).toBe(1);
    expect(params.isLeaf).toBe(true);
    expect(params.path.map((item: CascaderOption<RegionData>) => item.value)).toEqual([
      'zhejiang',
      'hangzhou',
    ]);
  });

  it('opens on trigger press and closes on leaf selection by default', () => {
    const onOpenChange = jest.fn();
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <Cascader options={options} onOpenChange={onOpenChange} placeholder="Pick" />,
      );
    });

    act(() => {
      testRenderer!.root.findByProps({ testID: 'cascader-trigger' }).props.onPress();
    });

    expect(onOpenChange).toHaveBeenCalledWith(true, { reason: 'trigger' });

    act(() => {
      testRenderer!.root
        .findByProps({ testID: 'cascader-option-0-0' })
        .props.onPress();
    });

    act(() => {
      testRenderer!.root
        .findByProps({ testID: 'cascader-option-1-0' })
        .props.onPress();
    });

    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: 'select' });
    expect(() => testRenderer!.root.findByProps({ testID: 'floating-panel-root' })).toThrow();
  });

  it('keeps popup open when closeOnSelectLeaf is false', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <Cascader closeOnSelectLeaf={false} options={options} defaultOpen />,
      );
    });

    act(() => {
      testRenderer!.root
        .findByProps({ testID: 'cascader-option-0-0' })
        .props.onPress();
    });

    act(() => {
      testRenderer!.root
        .findByProps({ testID: 'cascader-option-1-0' })
        .props.onPress();
    });

    expect(testRenderer!.root.findByProps({ testID: 'floating-panel-root' })).toBeTruthy();
  });
});
