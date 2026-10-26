import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { WheelGroup } from '../src';
import type { WheelGroupColumn } from '../src';

const columns: WheelGroupColumn[] = [
  [
    { labelText: 'Alpha', value: 'a' },
    { labelText: 'Beta', value: 'b' },
    { labelText: 'Gamma', value: 'c' },
  ],
];

const disabledColumns: WheelGroupColumn[] = [
  [
    { labelText: 'Alpha', value: 'a' },
    { labelText: 'Beta', value: 'b', disabled: true },
  ],
];

function scrollEvent(offsetY: number) {
  return {
    nativeEvent: {
      contentOffset: { x: 0, y: offsetY },
      contentSize: { width: 100, height: 1000 },
      layoutMeasurement: { width: 100, height: 220 },
    },
  };
}

it('renders every item in every column', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <WheelGroup columns={columns} defaultValue={['a']} />,
    );
  });

  expect(
    testRenderer!.root.findByProps({ testID: 'wheel-group-item-0-0' }),
  ).toBeTruthy();
  expect(
    testRenderer!.root.findByProps({ testID: 'wheel-group-item-0-2' }),
  ).toBeTruthy();
});

it('commits the centered item when the wheel settles', () => {
  const onChange = jest.fn();
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <WheelGroup columns={columns} defaultValue={['a']} onChange={onChange} />,
    );
  });

  act(() => {
    testRenderer!.root
      .findByProps({ testID: 'wheel-group-column-scroll-0' })
      .props.onMomentumScrollEnd(scrollEvent(44));
  });

  expect(onChange).toHaveBeenCalledWith(
    ['b'],
    expect.objectContaining({ columnIndex: 0, itemIndex: 1 }),
  );
});

it('commits after the drag ends when there is no momentum', () => {
  jest.useFakeTimers();
  const onChange = jest.fn();
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <WheelGroup columns={columns} defaultValue={['a']} onChange={onChange} />,
    );
  });

  act(() => {
    const scroll = testRenderer!.root.findByProps({
      testID: 'wheel-group-column-scroll-0',
    });
    scroll.props.onScrollBeginDrag(scrollEvent(0));
    scroll.props.onScrollEndDrag(scrollEvent(88));
  });

  act(() => {
    jest.advanceTimersByTime(160);
  });

  expect(onChange).toHaveBeenCalledWith(
    ['c'],
    expect.objectContaining({ columnIndex: 0, itemIndex: 2 }),
  );
  jest.useRealTimers();
});

it('selects a tapped item', () => {
  const onChange = jest.fn();
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <WheelGroup columns={columns} defaultValue={['a']} onChange={onChange} />,
    );
  });

  act(() => {
    testRenderer!.root
      .findByProps({ testID: 'wheel-group-item-0-2' })
      .props.onPress();
  });

  expect(onChange).toHaveBeenCalledWith(
    ['c'],
    expect.objectContaining({ columnIndex: 0, itemIndex: 2 }),
  );
});

it('ignores taps on disabled items', () => {
  const onChange = jest.fn();
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <WheelGroup
        columns={disabledColumns}
        defaultValue={['a']}
        onChange={onChange}
      />,
    );
  });

  act(() => {
    testRenderer!.root
      .findByProps({ testID: 'wheel-group-item-0-1' })
      .props.onPress();
  });

  expect(onChange).not.toHaveBeenCalled();
});

it('reports the active index while scrolling', () => {
  const onActiveIndexChange = jest.fn();
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <WheelGroup
        columns={columns}
        defaultValue={['a']}
        onActiveIndexChange={onActiveIndexChange}
      />,
    );
  });

  act(() => {
    testRenderer!.root
      .findByProps({ testID: 'wheel-group-column-scroll-0' })
      .props.onScroll(scrollEvent(44));
  });

  expect(onActiveIndexChange).toHaveBeenCalledWith(0, 1);
});

it('renders the empty placeholder for an empty column', () => {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <WheelGroup
        columns={[[], [{ labelText: 'One', value: 1 }]]}
        emptyText="No options"
      />,
    );
  });

  expect(JSON.stringify(testRenderer!.toJSON())).toContain('No options');
});
