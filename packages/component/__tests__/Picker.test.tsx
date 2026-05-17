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
  type PickerColumn,
  type PickerProps,
  type PickerStyles,
  type PickerValue,
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

function ControlledClearPicker({
  onChange,
  onClear,
}: {
  onChange?: PickerProps['onChange'];
  onClear?: PickerProps['onClear'];
}) {
  const [pickerValue, setPickerValue] = React.useState<PickerValue[]>(['b']);

  return (
    <Picker
      allowClear
      columns={columns}
      onClear={onClear}
      onChange={(nextValue, params) => {
        setPickerValue(nextValue);
        onChange?.(nextValue, params);
      }}
      value={pickerValue}
    />
  );
}

it('renders custom header via renderHeader', () => {
  const renderHeader = jest.fn(() => <Text>Custom Header</Text>);
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker
        columns={columns}
        defaultOpen
        popupProps={{ renderHeader }}
      />,
    );
  });

  expect(renderHeader).toHaveBeenCalledWith(
    expect.objectContaining({
      draftValue: [],
      columns,
      onCancel: expect.any(Function),
      onOk: expect.any(Function),
    }),
  );

  const allText = testRenderer!.root.findAllByType(Text);
  const customHeader = allText.find(node => node.props.children === 'Custom Header');
  expect(customHeader).toBeDefined();
});

it('renders paired text and custom node props', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker
        columns={columns}
        defaultOpen
        popupProps={{
          title: <Text>Custom title</Text>,
          cancel: <Text>Custom cancel</Text>,
          ok: <Text>Custom ok</Text>,
        }}
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
        popupProps={{ cancelText: 'Cancel' }}
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
        popupProps={{ okText: 'OK' }}
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

it('updates value when wheel column scroll settles', () => {
  const onChange = jest.fn();
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker columns={columns} defaultOpen value={['a']} onChange={onChange} />,
    );
  });

  act(() => {
    testRenderer!.root.findByProps({ testID: 'picker-column-scroll-0' }).props.onMomentumScrollEnd({
      nativeEvent: {
        contentOffset: { y: 44 },
      },
    });
  });

  expect(onChange).toHaveBeenCalledWith(['b'], expect.objectContaining({
    columnIndex: 0,
    itemIndex: 1,
    value: 'b',
  }));
});

it('disables ok when wheel focus is on disabled item', () => {
  const onOk = jest.fn();
  const disabledColumns: PickerColumn[] = [[
    { labelText: 'Alpha', value: 'a' },
    { labelText: 'Beta', value: 'b', disabled: true },
  ]];
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker columns={disabledColumns} defaultOpen value={['a']} onOk={onOk} />,
    );
  });

  act(() => {
    testRenderer!.root.findByProps({ testID: 'picker-column-scroll-0' }).props.onMomentumScrollEnd({
      nativeEvent: {
        contentOffset: { y: 44 },
      },
    });
  });

  expect(testRenderer!.root.findByProps({ testID: 'picker-ok-button' }).props.disabled).toBe(true);
  expect(
    JSON.stringify(testRenderer!.root.findByProps({ testID: 'picker-indicator' }).props.style),
  ).toContain('#ffccc7');

  act(() => {
    testRenderer!.root.findByProps({ testID: 'picker-column-scroll-0' }).props.onScrollBeginDrag();
  });

  expect(
    JSON.stringify(testRenderer!.root.findByProps({ testID: 'picker-indicator' }).props.style),
  ).not.toContain('#ffccc7');

  act(() => {
    testRenderer!.root.findByProps({ testID: 'picker-ok-button' }).props.onPress();
  });

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
      <Picker columns={[]} defaultOpen popupProps={{ emptyText: 'No data' }} />,
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
        popupProps={{ emptyText: 'No options' }}
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
        popupProps={{ loading: true, loadingIndicatorText: 'Loading' }}
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
        popupProps={{
          emptyText: 'No data',
          styles: {
            popup: styles.popup,
            panel: styles.panel,
          },
          titleText: 'Title',
        }}
        triggerStyle={styles.trigger}
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

it('locks wheel height after initial measurement to prevent indicator drift', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker columns={columns} defaultOpen />,
    );
  });

  const geometryReader = testRenderer!.root.findByProps({ testID: 'geometry-reader' });

  act(() => {
    geometryReader.props.onLayout({
      nativeEvent: {
        layout: {
          width: 320,
          height: 220,
        },
      },
    });
  });

  const initialScrollStyle = testRenderer!.root.findByProps({
    testID: 'picker-column-scroll-0',
  }).props.style;
  const initialIndicatorStyle = testRenderer!.root.findByProps({
    testID: 'picker-indicator',
  }).props.style;

  expect(JSON.stringify(initialScrollStyle)).toContain('"height":220');
  expect(JSON.stringify(initialIndicatorStyle)).toContain('"top":88');

  act(() => {
    geometryReader.props.onLayout({
      nativeEvent: {
        layout: {
          width: 320,
          height: 280,
        },
      },
    });
  });

  const nextScrollStyle = testRenderer!.root.findByProps({
    testID: 'picker-column-scroll-0',
  }).props.style;
  const nextIndicatorStyle = testRenderer!.root.findByProps({
    testID: 'picker-indicator',
  }).props.style;

  expect(JSON.stringify(nextScrollStyle)).toContain('"height":220');
  expect(JSON.stringify(nextIndicatorStyle)).toContain('"top":88');
});

it('positions indicator above first option when no value is selected', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker columns={columns} defaultOpen value={[]} />,
    );
  });

  const indicatorStyle = testRenderer!.root.findByProps({
    testID: 'picker-indicator',
  }).props.style;

  expect(JSON.stringify(indicatorStyle)).toContain('"top":44');
});

it('renders display input trigger when children is not provided', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker columns={columns} placeholder="Please select" />,
    );
  });

  const triggerInput = testRenderer!.root.findByType(DisplayInput);

  expect(triggerInput.props.readonly).toBe(true);
  expect(triggerInput.props.display).toBe('inline');
  expect(triggerInput.props.placeholder).toBe('Please select');
});

it('passes label to display input trigger', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker columns={columns} label="Account" />,
    );
  });

  const triggerInput = testRenderer!.root.findByType(DisplayInput);

  expect(triggerInput.props.label).toBe('Account');
});

it('shows selected label text in display input trigger', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker columns={columns} value={['b']} />,
    );
  });

  const triggerInput = testRenderer!.root.findByType(DisplayInput);

  expect(triggerInput.props.valueText).toBe('Beta');
});

it('clears controlled value through onChange', () => {
  const onChange = jest.fn();
  const onClear = jest.fn();
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <ControlledClearPicker onChange={onChange} onClear={onClear} />,
    );
  });

  expect(testRenderer!.root.findByType(DisplayInput).props.valueText).toBe('Beta');

  act(() => {
    testRenderer!.root
      .findByProps({ testID: 'picker-trigger-clear-button' })
      .props.onPress();
  });

  expect(onChange).toHaveBeenCalledWith([], expect.objectContaining({
    items: [undefined],
    reason: 'clear',
  }));
  expect(onClear).toHaveBeenCalledTimes(1);
  expect(testRenderer!.root.findByType(DisplayInput).props.valueText).toBeUndefined();
});

it('shows combined selected labels for multi-column picker trigger', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker columns={twoColumns} value={['a', 2]} />,
    );
  });

  const triggerInput = testRenderer!.root.findByType(DisplayInput);

  expect(triggerInput.props.valueText).toBe('A / Two');
});

it('allows overriding non-flattened display input props from picker', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker
        columns={columns}
        placeholder="Please select"
        displayInputProps={{
          display: 'block',
        }}
      />,
    );
  });

  const triggerInput = testRenderer!.root.findByType(DisplayInput);

  expect(triggerInput.props.display).toBe('block');
  expect(triggerInput.props.placeholder).toBe('Please select');
  expect(triggerInput.props.readonly).toBe(true);
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

it('centers title relative to panel when buttons have different widths', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker
        columns={columns}
        defaultOpen
        popupProps={{
          cancelText: 'Cancel',
          titleText: 'Title',
          okText: 'OK',
        }}
      />,
    );
  });

  const header = testRenderer!.root.findByProps({ testID: 'picker-header' });
  const cancelSide = testRenderer!.root.findByProps({ testID: 'picker-header-cancel-side' });
  const titleCenter = testRenderer!.root.findByProps({ testID: 'picker-header-title-center' });
  const okSide = testRenderer!.root.findByProps({ testID: 'picker-header-ok-side' });

  expect(JSON.stringify(header.props.style)).toContain('"flexDirection":"row"');
  expect(JSON.stringify(cancelSide.props.style)).toContain('"flex":1');
  expect(JSON.stringify(titleCenter.props.style)).toContain('"flex":1');
  expect(JSON.stringify(okSide.props.style)).toContain('"flex":1');
});
