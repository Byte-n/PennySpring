import React from 'react';
import renderer, { act } from 'react-test-renderer';

jest.mock('@react-navigation/material-top-tabs', () => ({
  createMaterialTopTabNavigator: () => ({
    Navigator: 'Navigator',
    Screen: 'Screen',
  }),
}));

jest.mock('react-native-drawer-layout', () => ({
  Drawer: 'Drawer',
}));

jest.mock('react-native-reanimated', () => {
  const ReactNative = require('react-native');

  return {
    __esModule: true,
    default: {
      View: ReactNative.View,
    },
    interpolate: (value: number) => value,
    useAnimatedStyle: (updater: () => Record<string, unknown>) => updater(),
    useSharedValue: (value: number) => ({ value }),
    withTiming: (value: number) => value,
  };
});

import {
  CascadePicker,
  Text,
  type CascadePickerOkParams,
  type CascadePickerOption,
  type CascadePickerProps,
} from '../src';

interface RegionData {
  code: string;
}

const options: Array<CascadePickerOption<RegionData>> = [
  {
    labelText: 'Guangdong',
    value: 'guangdong',
    data: { code: 'gd' },
    children: [
      {
        labelText: 'Shenzhen',
        value: 'shenzhen',
        data: { code: 'sz' },
        children: [
          { labelText: 'Nanshan', value: 'nanshan', data: { code: 'ns' } },
          { labelText: 'Futian', value: 'futian', data: { code: 'ft' } },
        ],
      },
      {
        labelText: 'Guangzhou',
        value: 'guangzhou',
        data: { code: 'gz' },
        children: [
          { labelText: 'Tianhe', value: 'tianhe', data: { code: 'th' } },
        ],
      },
    ],
  },
  {
    labelText: 'Beijing',
    value: 'beijing',
    data: { code: 'bj' },
    children: [
      {
        labelText: 'Haidian',
        value: 'haidian',
        data: { code: 'hd' },
      },
    ],
  },
];

it('exports CascadePicker component and public types', () => {
  const props: CascadePickerProps<RegionData> = { options };
  const okParams: CascadePickerOkParams<RegionData> = {
    path: [options[0]!],
    items: [options[0]!],
  };

  expect(CascadePicker).toBeTruthy();
  expect(props.options).toBe(options);
  expect(okParams.path[0]?.value).toBe('guangdong');
});

it('builds columns for the current value path', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <CascadePicker
        defaultOpen
        options={options}
        value={['guangdong', 'shenzhen', 'nanshan']}
      />,
    );
  });

  const tree = JSON.stringify(testRenderer!.toJSON());
  expect(tree).toContain('Guangdong');
  expect(tree).toContain('Shenzhen');
  expect(tree).toContain('Nanshan');

  // Selected state reflects the path
  expect(
    testRenderer!.root.findByProps({ testID: 'picker-item-0-0' }).props.selected,
  ).toBe(true);
  expect(
    testRenderer!.root.findByProps({ testID: 'picker-item-1-0' }).props.selected,
  ).toBe(true);
  expect(
    testRenderer!.root.findByProps({ testID: 'picker-item-2-0' }).props.selected,
  ).toBe(true);
});

it('drops deeper columns when node has no children', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <CascadePicker
        defaultOpen
        options={options}
        value={['beijing', 'haidian']}
      />,
    );
  });

  // Column 0 and 1 exist
  expect(testRenderer!.root.findByProps({ testID: 'picker-item-0-0' })).toBeTruthy();
  expect(testRenderer!.root.findByProps({ testID: 'picker-item-1-0' })).toBeTruthy();
  // No third column because 'haidian' has no children
  expect(() =>
    testRenderer!.root.findByProps({ testID: 'picker-item-2-0' }),
  ).toThrow();
});

it('recomputes subsequent columns when parent column changes', () => {
  const onChange = jest.fn();
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <CascadePicker
        defaultOpen
        options={options}
        value={['guangdong', 'shenzhen', 'nanshan']}
        onChange={onChange}
      />,
    );
  });

  // Change column 0 from Guangdong to Beijing (itemIndex 1)
  act(() => {
    testRenderer!.root.findByProps({ testID: 'picker-item-0-1' }).props.onPress();
  });

  expect(onChange).toHaveBeenCalledTimes(1);
  const [nextValue, params] = onChange.mock.calls[0];
  // Should complete the path to first child of Beijing → Haidian
  expect(nextValue).toEqual(['beijing', 'haidian']);
  expect(params.columnIndex).toBe(0);
  expect(params.path).toHaveLength(2);
  expect(params.path[0].value).toBe('beijing');
  expect(params.path[1].value).toBe('haidian');
});

it('keeps parent values and recomputes only child columns on child change', () => {
  const onChange = jest.fn();
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <CascadePicker
        defaultOpen
        options={options}
        value={['guangdong', 'shenzhen', 'nanshan']}
        onChange={onChange}
      />,
    );
  });

  // Change column 1 from Shenzhen to Guangzhou (itemIndex 1)
  act(() => {
    testRenderer!.root.findByProps({ testID: 'picker-item-1-1' }).props.onPress();
  });

  const [nextValue] = onChange.mock.calls[0];
  expect(nextValue).toEqual(['guangdong', 'guangzhou', 'tianhe']);
});

it('calls onOk with the final path', () => {
  const onOk = jest.fn();
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <CascadePicker
        defaultOpen
        options={options}
        defaultValue={['guangdong', 'shenzhen', 'nanshan']}
        onOk={onOk}
      />,
    );
  });

  act(() => {
    testRenderer!.root.findByProps({ testID: 'picker-ok-button' }).props.onPress();
  });

  expect(onOk).toHaveBeenCalledTimes(1);
  const [okValue, okParams] = onOk.mock.calls[0];
  expect(okValue).toEqual(['guangdong', 'shenzhen', 'nanshan']);
  expect(okParams.path.map((it: CascadePickerOption<RegionData>) => it.value)).toEqual([
    'guangdong',
    'shenzhen',
    'nanshan',
  ]);
  expect(okParams.path[2].data).toEqual({ code: 'ns' });
});

it('passes through onCancel and onOpenChange', () => {
  const onCancel = jest.fn();
  const onOpenChange = jest.fn();
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <CascadePicker
        defaultOpen
        options={options}
        value={['guangdong', 'shenzhen', 'nanshan']}
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

it('uses renderLabel with original option', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <CascadePicker<RegionData>
        defaultOpen
        options={options}
        value={['guangdong']}
        renderLabel={option => <Text>{`node-${option.data?.code ?? 'x'}`}</Text>}
      />,
    );
  });

  const tree = JSON.stringify(testRenderer!.toJSON());
  expect(tree).toContain('node-gd');
  expect(tree).toContain('node-bj');
});

it('truncates value when intermediate node is missing', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <CascadePicker
        defaultOpen
        options={options}
        value={['guangdong', 'unknown', 'nanshan']}
      />,
    );
  });

  // Guangdong still selected in column 0
  expect(
    testRenderer!.root.findByProps({ testID: 'picker-item-0-0' }).props.selected,
  ).toBe(true);
  // Column 1 exists but no item selected for unknown
  expect(
    testRenderer!.root.findByProps({ testID: 'picker-item-1-0' }).props.selected,
  ).toBe(false);
  // No column 2 because chain broke at column 1
  expect(() =>
    testRenderer!.root.findByProps({ testID: 'picker-item-2-0' }),
  ).toThrow();
});

it('renders empty state when options is empty', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <CascadePicker defaultOpen options={[]} emptyText="No data" />,
    );
  });

  expect(JSON.stringify(testRenderer!.toJSON())).toContain('No data');
});
