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
  Picker,
  Text,
  type PickerColumn,
  type PickerProps,
  type PickerStyles,
} from '../src';

const columns: PickerColumn[] = [
  [
    { labelText: 'Alpha', value: 'a' },
    { labelText: 'Beta', value: 'b' },
  ],
];

interface UnsupportedBusinessPickerProps extends PickerProps {
  ref?: React.Ref<unknown>;
  placeholder?: string;
  retry?: () => undefined;
}

const UnsupportedBusinessPicker = Picker as unknown as React.ComponentType<
  UnsupportedBusinessPickerProps
>;

it('renders paired text and custom node props', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker
        columns={columns}
        defaultOpen
        title={<Text>Custom title</Text>}
        cancel={<Text>Custom cancel</Text>}
        ok={<Text>Custom ok</Text>}
      />,
    );
  });

  const tree = JSON.stringify(testRenderer!.toJSON());

  expect(tree).toContain('Custom title');
  expect(tree).toContain('Custom cancel');
  expect(tree).toContain('Custom ok');
});

it('opens from trigger in uncontrolled mode', () => {
  const onOpenChange = jest.fn();
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker columns={columns} onOpenChange={onOpenChange}>
        <Text>Open picker</Text>
      </Picker>,
    );
  });

  act(() => {
    testRenderer!.root.findByProps({ testID: 'picker-trigger' }).props.onPress();
  });

  expect(onOpenChange).toHaveBeenCalledWith(true, { reason: 'trigger' });
  expect(JSON.stringify(testRenderer!.toJSON())).toContain('Alpha');
});

it('requests open in controlled mode', () => {
  const onOpenChange = jest.fn();
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker columns={columns} open={false} onOpenChange={onOpenChange}>
        <Text>Open picker</Text>
      </Picker>,
    );
  });

  act(() => {
    testRenderer!.root.findByProps({ testID: 'picker-trigger' }).props.onPress();
  });

  expect(onOpenChange).toHaveBeenCalledWith(true, { reason: 'trigger' });
  expect(JSON.stringify(testRenderer!.toJSON())).not.toContain('Alpha');
});

it('does not emit cancel or open change for external close', () => {
  const onCancel = jest.fn();
  const onOk = jest.fn();
  const onOpenChange = jest.fn();
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker
        columns={columns}
        open
        onCancel={onCancel}
        onOk={onOk}
        onOpenChange={onOpenChange}
      />,
    );
  });

  act(() => {
    testRenderer!.update(
      <Picker
        columns={columns}
        open={false}
        onCancel={onCancel}
        onOk={onOk}
        onOpenChange={onOpenChange}
      />,
    );
  });

  expect(onCancel).not.toHaveBeenCalled();
  expect(onOk).not.toHaveBeenCalled();
  expect(onOpenChange).not.toHaveBeenCalled();
});

it('calls cancel then open change for cancel button', () => {
  const calls: string[] = [];
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker
        columns={columns}
        defaultOpen
        cancelText="Cancel"
        onCancel={params => calls.push(`cancel:${params.reason}`)}
        onOpenChange={(open, params) => calls.push(`open:${open}:${params.reason}`)}
      />,
    );
  });

  act(() => {
    testRenderer!.root.findByProps({ testID: 'picker-cancel-button' }).props.onPress();
  });

  expect(calls).toEqual(['cancel:cancel', 'open:false:cancel']);
});

it('calls cancel then open change for mask press', () => {
  const calls: string[] = [];
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker
        columns={columns}
        defaultOpen
        onCancel={params => calls.push(`cancel:${params.reason}`)}
        onOpenChange={(open, params) => calls.push(`open:${open}:${params.reason}`)}
      />,
    );
  });

  act(() => {
    testRenderer!.root.findByProps({ testID: 'popup-mask' }).props.onPress();
  });

  expect(calls).toEqual(['cancel:mask', 'open:false:mask']);
});

it('calls ok then open change for ok button', () => {
  const calls: string[] = [];
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker
        columns={columns}
        defaultOpen
        okText="OK"
        onCancel={() => calls.push('cancel')}
        onOk={value => calls.push(`ok:${value.join(',')}`)}
        onOpenChange={(open, params) => calls.push(`open:${open}:${params.reason}`)}
      />,
    );
  });

  act(() => {
    testRenderer!.root.findByProps({ testID: 'picker-ok-button' }).props.onPress();
  });

  expect(calls).toEqual(['ok:', 'open:false:ok']);
});

it('initializes draft from current value when opened', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker columns={columns} defaultOpen value={['b']} />,
    );
  });

  expect(
    testRenderer!.root.findByProps({ testID: 'picker-item-0-1' }).props.selected,
  ).toBe(true);
});

it('changes draft value before confirmation', () => {
  const onChange = jest.fn();
  const onOk = jest.fn();
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker columns={columns} defaultOpen value={['a']} onChange={onChange} onOk={onOk} />,
    );
  });

  act(() => {
    testRenderer!.root.findByProps({ testID: 'picker-item-0-1' }).props.onPress();
  });

  expect(onChange).toHaveBeenCalledWith(['b'], expect.objectContaining({
    columnIndex: 0,
    itemIndex: 1,
    value: 'b',
  }));
  expect(onOk).not.toHaveBeenCalled();
});

it('commits uncontrolled main value on ok', () => {
  const onOk = jest.fn();
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker columns={columns} defaultOpen defaultValue={['a']} onOk={onOk} />,
    );
  });
  act(() => {
    testRenderer!.root.findByProps({ testID: 'picker-item-0-1' }).props.onPress();
    testRenderer!.root.findByProps({ testID: 'picker-ok-button' }).props.onPress();
    testRenderer!.root.findByProps({ testID: 'picker-trigger' }).props.onPress();
  });

  expect(onOk).toHaveBeenCalledWith(['b'], expect.objectContaining({
    items: [expect.objectContaining({ value: 'b' })],
  }));
  expect(testRenderer!.root.findByProps({ testID: 'picker-item-0-1' }).props.selected).toBe(true);
});

it('resyncs draft when controlled value changes while open', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker columns={columns} open value={['a']} />,
    );
  });
  act(() => {
    testRenderer!.update(<Picker columns={columns} open value={['b']} />);
  });

  expect(testRenderer!.root.findByProps({ testID: 'picker-item-0-1' }).props.selected).toBe(true);
});

const twoColumns: PickerColumn[] = [
  [{ labelText: 'A', value: 'a' }],
  [
    { labelText: 'One', value: 1 },
    { labelText: 'Two', value: 2 },
  ],
];

it('updates one column without cascading other columns', () => {
  const onChange = jest.fn();
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker columns={twoColumns} defaultOpen value={['a', 1]} onChange={onChange} />,
    );
  });
  act(() => {
    testRenderer!.root.findByProps({ testID: 'picker-item-1-1' }).props.onPress();
  });

  expect(onChange).toHaveBeenCalledWith(['a', 2], expect.objectContaining({
    columnIndex: 1,
    itemIndex: 1,
    value: 2,
  }));
});

it('ignores disabled item selection', () => {
  const onChange = jest.fn();
  const disabledColumns: PickerColumn[] = [[
    { labelText: 'Alpha', value: 'a' },
    { labelText: 'Beta', value: 'b', disabled: true },
  ]];
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker columns={disabledColumns} defaultOpen value={['a']} onChange={onChange} />,
    );
  });
  act(() => {
    testRenderer!.root.findByProps({ testID: 'picker-item-0-1' }).props.onPress();
  });

  expect(onChange).not.toHaveBeenCalled();
  expect(testRenderer!.root.findByProps({ testID: 'picker-item-0-0' }).props.selected).toBe(true);
});

it('opens readonly picker but prevents selection changes', () => {
  const onChange = jest.fn();
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker columns={columns} readonly onChange={onChange}>
        <Text>Open picker</Text>
      </Picker>,
    );
  });
  act(() => {
    testRenderer!.root.findByProps({ testID: 'picker-trigger' }).props.onPress();
    testRenderer!.root.findByProps({ testID: 'picker-item-0-1' }).props.onPress();
  });

  expect(JSON.stringify(testRenderer!.toJSON())).toContain('Alpha');
  expect(onChange).not.toHaveBeenCalled();
});

it('disabled picker blocks trigger and ok', () => {
  const onOk = jest.fn();
  const onOpenChange = jest.fn();
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker columns={columns} disabled open onOk={onOk} onOpenChange={onOpenChange}>
        <Text>Open picker</Text>
      </Picker>,
    );
  });
  act(() => {
    testRenderer!.root.findByProps({ testID: 'picker-trigger' }).props.onPress();
    testRenderer!.root.findByProps({ testID: 'picker-ok-button' }).props.onPress();
  });

  expect(onOk).not.toHaveBeenCalled();
  expect(onOpenChange).not.toHaveBeenCalledWith(true, { reason: 'trigger' });
});

it('renders empty state when all columns are empty', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker columns={[]} defaultOpen emptyText="No data" />,
    );
  });

  expect(JSON.stringify(testRenderer!.toJSON())).toContain('No data');
});

it('renders empty column placeholder without selected value', () => {
  const onOk = jest.fn();
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker
        columns={[[], [{ labelText: 'One', value: 1 }]]}
        defaultOpen
        emptyText="No options"
        onOk={onOk}
      />,
    );
  });

  act(() => {
    testRenderer!.root.findByProps({ testID: 'picker-ok-button' }).props.onPress();
  });

  expect(JSON.stringify(testRenderer!.toJSON())).toContain('No options');
  expect(onOk).toHaveBeenCalledWith([], expect.objectContaining({
    items: [undefined, undefined],
  }));
});

it('renders loading content without combining disabled state', () => {
  const onOk = jest.fn();
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker
        columns={columns}
        defaultOpen
        loading
        loadingIndicatorText="Loading"
        onOk={onOk}
      />,
    );
  });

  act(() => {
    testRenderer!.root.findByProps({ testID: 'picker-ok-button' }).props.onPress();
  });

  expect(JSON.stringify(testRenderer!.toJSON())).toContain('Loading');
  expect(onOk).toHaveBeenCalled();
});

it('does not auto fallback for missing or invalid values', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker columns={columns} defaultOpen value={['missing', 'extra']} />,
    );
  });

  expect(testRenderer!.root.findByProps({ testID: 'picker-item-0-0' }).props.selected).toBe(false);
  expect(testRenderer!.root.findByProps({ testID: 'picker-item-0-1' }).props.selected).toBe(false);
});

it('applies supported style slots', () => {
  const styles: PickerStyles = {
    trigger: { opacity: 0.91 },
    popup: {
      popup: { opacity: 0.92 },
      mask: { opacity: 0.93 },
    },
    panel: {
      panel: { opacity: 0.94 },
      header: {
        cancelButton: { opacity: 0.96 },
        cancelText: { opacity: 0.97 },
        titleContainer: { opacity: 0.98 },
        titleText: { opacity: 0.99 },
        okButton: { opacity: 0.88 },
        okText: { opacity: 0.87 },
      },
      body: {
        body: { opacity: 0.86 },
        view: {
          column: {
            column: { opacity: 0.84 },
            item: { opacity: 0.83 },
            itemText: { opacity: 0.82 },
          },
          indicator: { opacity: 0.77 },
        },
        loading: { opacity: 0.76 },
        empty: { opacity: 0.75 },
      },
      safeArea: { opacity: 0.74 },
    },
  };
  const styledColumns: PickerColumn[] = [[
    { labelText: 'Alpha', value: 'a' },
    { labelText: 'Beta', value: 'b', disabled: true },
  ]];
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker
        columns={styledColumns}
        defaultOpen
        emptyText="No data"
        styles={styles}
        titleText="Title"
        value={['a']}
      />,
    );
  });

  const tree = testRenderer!.root;
  const cancelButtonStyle = tree
    .findByProps({ testID: 'picker-cancel-button' })
    .props.style;
  const okButtonStyle = tree
    .findByProps({ testID: 'picker-ok-button' })
    .props.style;

  expect(JSON.stringify(tree.findByProps({ testID: 'picker-trigger' }).props.style)).toContain('0.91');
  expect(JSON.stringify(tree.findByProps({ testID: 'popup-mask' }).props.style)).toContain('0.93');
  expect(JSON.stringify(cancelButtonStyle)).toContain('0.96');
  expect(JSON.stringify(okButtonStyle)).toContain('0.88');
  expect(JSON.stringify(tree.findByProps({ testID: 'picker-indicator' }).props.style)).toContain('0.77');
});

it('shows floating panel drag handle indicator by default', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker columns={columns} defaultOpen />,
    );
  });

  const indicatorStyle = testRenderer!.root.findByProps({
    testID: 'floating-panel-handle-indicator',
  }).props.style;

  expect(JSON.stringify(indicatorStyle)).not.toContain('"height":0');
});

it('renders input trigger when children is not provided', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker columns={columns} placeholder="Please select" />,
    );
  });

  const triggerInput = testRenderer!.root.findByProps({
    testID: 'picker-trigger-input',
  });

  expect(triggerInput.props.readonly).toBe(true);
  expect(triggerInput.props.placeholder).toBe('Please select');
});

it('does not expose imperative business features', () => {
  const pickerRef = React.createRef<unknown>();
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <UnsupportedBusinessPicker
        ref={pickerRef}
        columns={columns}
        defaultOpen
        retry={() => undefined}
      />,
    );
  });

  expect(pickerRef.current).toBeNull();
  expect(JSON.stringify(testRenderer!.toJSON())).not.toContain('retry');
});
