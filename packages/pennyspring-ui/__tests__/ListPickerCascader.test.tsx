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
    Easing: {
      bezier: jest.fn(() => (value: number) => value),
    },
    interpolate: (value: number) => value,
    runOnJS: jest.fn(fn => fn),
    useAnimatedStyle: (updater: () => Record<string, unknown>) => updater(),
    useSharedValue: (value: number) => ({ value }),
    withTiming: jest.fn((value: number, _config: unknown, callback?: (finished: boolean) => void) => {
      if (typeof callback === 'function') {
        callback(true);
      }
      return value;
    }),
  };
});

import {
  DisplayInput,
  ListPicker,
  type ListPickerCascaderOption,
} from '../src';

interface RegionData {
  code: string;
}

function getTagCloseButtons(testRenderer: renderer.ReactTestRenderer) {
  return testRenderer.root
    .findAllByProps({ testID: 'tag-close' })
    .filter(item => typeof item.props.onPress === 'function');
}

const options: Array<ListPickerCascaderOption<RegionData>> = [
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

describe('ListPicker.Cascader', () => {
  it('renders level tabs and root options', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ListPicker.Cascader
          defaultOpen
          options={options}
          texts={{ tabPlaceholderText: 'Select' }}
        />,
      );
    });

    const tree = JSON.stringify(testRenderer!.toJSON());

    expect(tree).toContain('Select');
    expect(tree).toContain('Zhejiang');
    expect(tree).toContain('Guangdong');

    act(() => {
      testRenderer!.unmount();
    });
  });

  it('selects a parent option and switches list to the next level', () => {
    const onChange = jest.fn();
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ListPicker.Cascader
          defaultOpen
          options={options}
          onChange={onChange}
        />,
      );
    });

    act(() => {
      testRenderer!.root
        .findByProps({ testID: 'list-picker-cascader-option-0-0' })
        .props.onPress();
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    const [value, params] = onChange.mock.calls[0];
    expect(value).toEqual(['zhejiang']);
    expect(params.reason).toBe('select');
    expect(params.level).toBe(0);
    expect(params.optionIndex).toBe(0);
    expect(params.isLeaf).toBe(false);

    const tree = JSON.stringify(testRenderer!.toJSON());
    expect(tree).toContain('Hangzhou');
    expect(tree).toContain('Ningbo');

    act(() => {
      testRenderer!.unmount();
    });
  });

  it('renders selected and unselected markers', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ListPicker.Cascader
          defaultActiveLevel={0}
          defaultOpen
          defaultValue={['zhejiang']}
          options={options}
        />,
      );
    });

    const selectedMarker = testRenderer!.root.findByProps({
      testID: 'list-picker-cascader-option-marker-selected',
    });
    const unselectedMarker = testRenderer!.root.findByProps({
      testID: 'list-picker-cascader-option-marker-unselected',
    });

    expect(selectedMarker).toBeTruthy();
    expect(unselectedMarker).toBeTruthy();

    act(() => {
      testRenderer!.unmount();
    });
  });

  it('selects a leaf option and returns the full path with isLeaf=true', () => {
    const onChange = jest.fn();
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ListPicker.Cascader
          defaultOpen
          defaultValue={['zhejiang']}
          options={options}
          onChange={onChange}
        />,
      );
    });

    act(() => {
      testRenderer!.root
        .findByProps({ testID: 'list-picker-cascader-option-1-0' })
        .props.onPress();
    });

    const [value, params] = onChange.mock.calls[0];
    expect(value).toEqual(['zhejiang', 'hangzhou']);
    expect(params.level).toBe(1);
    expect(params.isLeaf).toBe(true);
    expect(params.path.map((item: ListPickerCascaderOption<RegionData>) => item.value)).toEqual([
      'zhejiang',
      'hangzhou',
    ]);

    act(() => {
      testRenderer!.unmount();
    });
  });

  it('opens on trigger press and closes on leaf selection by default', () => {
    const onOpenChange = jest.fn();
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ListPicker.Cascader
          labelText="Pick"
          options={options}
          onOpenChange={onOpenChange}
        />,
      );
    });

    act(() => {
      testRenderer!.root.findByType(DisplayInput).props.onPress();
    });

    expect(onOpenChange).toHaveBeenCalledWith(true, { reason: 'trigger' });

    act(() => {
      testRenderer!.root
        .findByProps({ testID: 'list-picker-cascader-option-0-0' })
        .props.onPress();
    });

    act(() => {
      testRenderer!.root
        .findByProps({ testID: 'list-picker-cascader-option-1-0' })
        .props.onPress();
    });

    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: 'select' });
    expect(() =>
      testRenderer!.root.findByProps({ testID: 'floating-panel-root' }),
    ).toThrow();

    act(() => {
      testRenderer!.unmount();
    });
  });

  it('keeps the popup open when closeOnSelectLeaf is false', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ListPicker.Cascader
          closeOnSelectLeaf={false}
          defaultOpen
          options={options}
        />,
      );
    });

    act(() => {
      testRenderer!.root
        .findByProps({ testID: 'list-picker-cascader-option-0-0' })
        .props.onPress();
    });

    act(() => {
      testRenderer!.root
        .findByProps({ testID: 'list-picker-cascader-option-1-0' })
        .props.onPress();
    });

    expect(
      testRenderer!.root.findByProps({ testID: 'floating-panel-root' }),
    ).toBeTruthy();

    act(() => {
      testRenderer!.unmount();
    });
  });

  it('calls onChange when removing a tag in uncontrolled mode', () => {
    const onChange = jest.fn();
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ListPicker.Cascader
          defaultValue={['zhejiang', 'hangzhou']}
          displayMode="tag"
          options={options}
          onChange={onChange}
        />,
      );
    });

    act(() => {
      getTagCloseButtons(testRenderer!)[1].props.onPress();
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    const [value, params] = onChange.mock.calls[0];
    expect(value).toEqual(['zhejiang']);
    expect(params.reason).toBe('remove');
    expect(params.value).toBe('hangzhou');
    expect(params.level).toBe(1);

    act(() => {
      testRenderer!.unmount();
    });
  });

  it('calls onChange when removing a tag in controlled mode', () => {
    const onChange = jest.fn();
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ListPicker.Cascader
          displayMode="tag"
          options={options}
          value={['zhejiang', 'hangzhou']}
          onChange={onChange}
        />,
      );
    });

    act(() => {
      getTagCloseButtons(testRenderer!)[1].props.onPress();
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    const [value, params] = onChange.mock.calls[0];
    expect(value).toEqual(['zhejiang']);
    expect(params.value).toBe('hangzhou');
    expect(params.level).toBe(1);
    expect(params.path.map((item: ListPickerCascaderOption<RegionData>) => item.value)).toEqual([
      'zhejiang',
    ]);

    act(() => {
      testRenderer!.unmount();
    });
  });

  it('clears the value through allowClear and reports a clear change', () => {
    const onChange = jest.fn();
    const onClear = jest.fn();
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ListPicker.Cascader
          allowClear
          defaultValue={['zhejiang', 'hangzhou']}
          onClear={onClear}
          options={options}
          onChange={onChange}
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
    const [value, params] = onChange.mock.calls[0];
    expect(value).toEqual([]);
    expect(params.reason).toBe('clear');

    act(() => {
      testRenderer!.unmount();
    });
  });

  it('does not open when disabled or readonly', () => {
    const disabledOpenChange = jest.fn();
    const readonlyOpenChange = jest.fn();
    let disabledRenderer: renderer.ReactTestRenderer;
    let readonlyRenderer: renderer.ReactTestRenderer;

    act(() => {
      disabledRenderer = renderer.create(
        <ListPicker.Cascader
          disabled
          options={options}
          onOpenChange={disabledOpenChange}
        />,
      );
      readonlyRenderer = renderer.create(
        <ListPicker.Cascader
          options={options}
          onOpenChange={readonlyOpenChange}
          readonly
        />,
      );
    });

    act(() => {
      disabledRenderer!.root.findByType(DisplayInput).props.onPress();
      readonlyRenderer!.root.findByType(DisplayInput).props.onPress();
    });

    expect(disabledOpenChange).not.toHaveBeenCalled();
    expect(readonlyOpenChange).not.toHaveBeenCalled();

    act(() => {
      disabledRenderer!.unmount();
      readonlyRenderer!.unmount();
    });
  });

  it('ignores disabled options', () => {
    const onChange = jest.fn();
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ListPicker.Cascader
          defaultOpen
          options={[
            { value: 'blocked', labelText: 'Blocked', disabled: true },
            { value: 'available', labelText: 'Available' },
          ]}
          onChange={onChange}
        />,
      );
    });

    act(() => {
      testRenderer!.root
        .findByProps({ testID: 'list-picker-cascader-option-0-0' })
        .props.onPress();
    });

    expect(onChange).not.toHaveBeenCalled();

    act(() => {
      testRenderer!.unmount();
    });
  });

  it('honors the controlled active level', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ListPicker.Cascader
          activeLevel={1}
          defaultOpen
          defaultValue={['zhejiang']}
          options={options}
        />,
      );
    });

    const tree = JSON.stringify(testRenderer!.toJSON());
    expect(tree).toContain('Hangzhou');
    expect(tree).toContain('Ningbo');
    expect(tree).not.toContain('Guangdong');

    act(() => {
      testRenderer!.unmount();
    });
  });

  it('renders empty and loading states', () => {
    let emptyRenderer: renderer.ReactTestRenderer;
    let loadingRenderer: renderer.ReactTestRenderer;

    act(() => {
      emptyRenderer = renderer.create(
        <ListPicker.Cascader
          defaultOpen
          options={[]}
          texts={{ emptyText: 'No options' }}
        />,
      );
      loadingRenderer = renderer.create(
        <ListPicker.Cascader
          defaultOpen
          loading
          options={options}
          texts={{ loadingText: 'Loading options' }}
        />,
      );
    });

    expect(
      JSON.stringify(emptyRenderer!.toJSON()),
    ).toContain('No options');
    expect(
      JSON.stringify(loadingRenderer!.toJSON()),
    ).toContain('Loading options');

    act(() => {
      emptyRenderer!.unmount();
      loadingRenderer!.unmount();
    });
  });

  it('renders trigger label and selected path text', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ListPicker.Cascader
          defaultValue={['zhejiang', 'hangzhou']}
          labelText="Region"
          options={options}
        />,
      );
    });

    const tree = JSON.stringify(testRenderer!.toJSON());
    expect(tree).toContain('Region');
    expect(tree).toContain('Zhejiang / Hangzhou');

    act(() => {
      testRenderer!.unmount();
    });
  });
});
