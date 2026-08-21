import React from 'react';
import renderer, { act } from 'react-test-renderer';

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

import { Button, DisplayInput, Picker, Text, PickerColumn, PickerColumnItemData, PickerProps, PickerValue } from '../src';

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

interface AccountPickerItem extends PickerColumnItemData<'cash' | 'card'> {
  data: {
    kind: 'asset';
  };
}

const accountColumns: AccountPickerItem[][] = [
  [
    { labelText: 'Cash', value: 'cash', data: { kind: 'asset' } },
    { labelText: 'Card', value: 'card', data: { kind: 'asset' } },
  ],
];

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
  const renderHeader = jest.fn(({ header }) => (
    <>
      {header}
      <Text>Custom Header</Text>
    </>
  ));
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker
        columns={columns}
        defaultOpen
        popupProps={{ renderHeader, titleText: 'Default Header' }}
      />,
    );
  });

  expect(renderHeader).toHaveBeenCalledWith(
    expect.objectContaining({
      draftValue: [],
      columns,
      header: expect.anything(),
      onCancel: expect.any(Function),
      onOk: expect.any(Function),
    }),
  );

  const allText = testRenderer!.root.findAllByType(Text);
  const defaultHeader = allText.find(node => node.props.children === 'Default Header');
  const customHeader = allText.find(node => node.props.children === 'Custom Header');
  expect(defaultHeader).toBeDefined();
  expect(customHeader).toBeDefined();
});

it('renders the picker header through Popup.FloatingPanel header slot', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker
        columns={columns}
        defaultOpen
        popupProps={{ titleText: '选择项目' }}
      />,
    );
  });

  const floatingPanelHeader = testRenderer!.root.findByProps({
    testID: 'floating-panel-header',
  });

  expect(floatingPanelHeader.findByProps({
    testID: 'picker-header',
  })).toBeTruthy();
});

it('does not render picker header when renderHeader is null', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker columns={columns} defaultOpen popupProps={{ renderHeader: null }} />,
    );
  });

  expect(testRenderer!.root.findAllByProps({ testID: 'picker-header' })).toHaveLength(0);
});

it('does not render picker title or action slots when they are null', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker
        columns={columns}
        defaultOpen
        popupProps={{
          cancel: null,
          ok: null,
          title: null,
          titleText: 'Default Header',
        }}
      />,
    );
  });

  const tree = JSON.stringify(testRenderer!.toJSON());

  expect(tree).not.toContain('picker-title-text');
  expect(tree).not.toContain('picker-cancel-button');
  expect(tree).not.toContain('picker-ok-button');
  expect(tree).not.toContain('Default Header');
});

it('does not open when readonly', () => {
  const onOpenChange = jest.fn();
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker columns={columns} onOpenChange={onOpenChange} readonly />,
    );
  });

  act(() => {
    const displayInput = testRenderer!.root.findByType(DisplayInput);
    displayInput.props.onPress();
  });

  const displayInput = testRenderer!.root.findByType(DisplayInput);
  const trigger = displayInput.find(
    node => node.props.onPress !== undefined && node.props.disabled !== undefined,
  );

  expect(trigger.props.disabled).toBe(true);
  expect(onOpenChange).not.toHaveBeenCalled();
});

it('infers value and callback params from picker column item type', () => {
  const element = (
    <Picker
      columns={accountColumns}
      onChange={(nextValue, params) => {
        const value: Array<'cash' | 'card'> = nextValue;
        const item: AccountPickerItem = params.items[0]!;

        if (params.reason === 'select') {
          const selectedValue: 'cash' | 'card' = params.value;
          const selectedItem: AccountPickerItem = params.item;

          expect(selectedItem.data.kind).toBe('asset');
          expect(['cash', 'card']).toContain(selectedValue);
        }

        expect(value).toEqual(expect.any(Array));
        expect(item.data.kind).toBe('asset');
      }}
      onOk={(nextValue, params) => {
        const value: Array<'cash' | 'card'> = nextValue;
        const item: AccountPickerItem = params.items[0]!;

        expect(value).toEqual(expect.any(Array));
        expect(item.data.kind).toBe('asset');
      }}
      popupProps={{
        renderLabel: item => item.data.kind,
      }}
      value={['cash']}
    />
  );

  expect(element.props.value).toEqual(['cash']);
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
    const displayInput = testRenderer!.root.findByType(DisplayInput);
    displayInput.props.onPress();
  });

  expect(onOpenChange).toHaveBeenCalledWith(true, { reason: 'trigger' });
  expect(JSON.stringify(testRenderer!.toJSON())).toContain('Alpha');
});

it('opens from the interactive picker trigger', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(<Picker columns={columns} />);
  });

  const displayInput = testRenderer!.root.findByType(DisplayInput);
  const trigger = displayInput.find(
    node => node.props.onPress !== undefined && node.props.disabled !== undefined,
  );

  act(() => {
    trigger.props.onPress();
  });

  expect(trigger.props.disabled).toBe(false);
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
    const displayInput = testRenderer!.root.findByType(DisplayInput);
    displayInput.props.onPress();
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
    const displayInput = testRenderer!.root.findByType(DisplayInput);
    displayInput.props.onPress();
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
    const displayInput = testRenderer!.root.findByType(DisplayInput);
    displayInput.props.onPress();
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
  const calls: string[] = [];
  const onChange = jest.fn();
  const onClear = jest.fn();
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <ControlledClearPicker
        onClear={() => {
          calls.push('clear');
          onClear();
        }}
        onChange={(nextValue, params) => {
          calls.push(`change:${params.reason}`);
          onChange(nextValue, params);
        }}
      />,
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
  expect(calls).toEqual(['clear', 'change:clear']);
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

it('uses formatValueText to override display input trigger text', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker
        columns={twoColumns}
        value={['a', 2]}
        formatValueText={value => value.join(':')}
      />,
    );
  });

  const triggerInput = testRenderer!.root.findByType(DisplayInput);

  expect(triggerInput.props.valueText).toBe('a:2');
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

it('passes size to display input trigger', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker columns={columns} size="small" />,
    );
  });

  const triggerInput = testRenderer!.root.findByType(DisplayInput);

  expect(triggerInput.props.size).toBe('small');
});

it('passes size to header action buttons when open', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker columns={columns} defaultOpen size="large" popupProps={{ okText: 'OK', cancelText: 'Cancel' }} />,
    );
  });

  const buttons = testRenderer!.root.findAllByType(Button);
  const cancelButton = buttons.find(
    node => node.props.testID === 'picker-cancel-button',
  );
  const okButton = buttons.find(
    node => node.props.testID === 'picker-ok-button',
  );

  expect(cancelButton?.props.size).toBe('large');
  expect(okButton?.props.size).toBe('large');
});

it('uses Row for header horizontal layout instead of View with flexDirection', () => {
  const PickerHeaderModule = require('../src/Picker/PickerHeader');
  const headerSource = String(PickerHeaderModule.PickerHeader);

  expect(headerSource).toContain('Row');
});

it('places title on the left and groups action buttons in a right-side container', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker
        columns={columns}
        defaultOpen
        popupProps={{ titleText: '选择项目', cancelText: '取消', okText: '确定' }}
      />,
    );
  });

  const root = testRenderer!.root;

  // 右侧按钮容器存在，两个按钮都在其中，且取消在确定之前
  const actions = root.findByProps({ testID: 'picker-header-actions' });
  expect(
    actions.findAllByType(Button).map(button => button.props.testID),
  ).toEqual(['picker-cancel-button', 'picker-ok-button']);

  // 标题文本在 DFS 顺序上早于按钮容器，体现“标题在左、按钮容器在右”
  const dfs = root.findAll(() => true);
  const titleTextIndex = dfs.findIndex(
    node => node.type === Text && node.props.children === '选择项目',
  );
  const actionsIndex = dfs.findIndex(
    node => node.props?.testID === 'picker-header-actions',
  );
  expect(titleTextIndex).toBeGreaterThanOrEqual(0);
  expect(actionsIndex).toBeGreaterThan(titleTextIndex);
});

it('renders title text with xl size and strong weight matching ImagePicker', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker columns={columns} defaultOpen popupProps={{ titleText: '选择项目' }} />,
    );
  });

  const titleText = testRenderer!.root.findAllByType(Text).find(
    node => node.props.children === '选择项目',
  );

  expect(titleText).toBeDefined();
  expect(titleText!.props.size).toBe('xl');
  expect(titleText!.props.weight).toBe('strong');
});

it('defaults cancel button to danger and ok button to primary color', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <Picker columns={columns} defaultOpen popupProps={{ cancelText: '取消', okText: '确定' }} />,
    );
  });

  const cancelButton = testRenderer!.root.findByProps({ testID: 'picker-cancel-button' });
  const okButton = testRenderer!.root.findByProps({ testID: 'picker-ok-button' });

  expect(cancelButton.props.color).toBe('danger');
  expect(okButton.props.color).toBe('primary');
});
