import React from 'react';
import {
  BackHandler,
  Pressable,
  StyleSheet,
  Text as RNText,
  View,
} from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Tooltip } from '../src/Tooltip';

const OVERLAY = { x: 0, y: 0, width: 400, height: 800 };

/**
 * 组件先测触发器、再测浮层容器（同一轮测量固定两次），
 * 用调用序模拟两个节点的窗口坐标。
 */
function mockPosition(
  anchor: { x: number; y: number; width: number; height: number },
  overlay = OVERLAY,
) {
  let call = 0;

  return jest
    .spyOn(
      View.prototype as unknown as {
        measureInWindow: (callback: (...params: number[]) => void) => void;
      },
      'measureInWindow',
    )
    .mockImplementation(callback => {
      const rect = call % 2 === 0 ? anchor : overlay;
      call += 1;
      callback(rect.x, rect.y, rect.width, rect.height);
    });
}

function renderTooltip(
  props: Partial<React.ComponentProps<typeof Tooltip>> = {},
) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(
      <Tooltip content="按每月最后一天的余额合计" {...props}>
        <RNText>Trigger</RNText>
      </Tooltip>,
    );
  });
  return testRenderer!;
}

function mockMeasurements(rects: Array<[number, number, number, number]>) {
  let call = 0;

  return jest
    .spyOn(
      View.prototype as unknown as {
        measureInWindow: (callback: (...params: number[]) => void) => void;
      },
      'measureInWindow',
    )
    .mockImplementation(callback => {
      const rect = rects[Math.min(call, rects.length - 1)];
      call += 1;
      callback(...rect);
    });
}

function findBubble(testRenderer: renderer.ReactTestRenderer) {
  return testRenderer.root.findAll(
    node =>
      node.props.testID === 'tooltip-content' && typeof node.type === 'string',
  );
}

function findBubbleStyle(testRenderer: renderer.ReactTestRenderer) {
  const bubble = findBubble(testRenderer)[0];

  return StyleSheet.flatten(bubble.props.style);
}

function findArrows(testRenderer: renderer.ReactTestRenderer) {
  return testRenderer.root.findAll(
    node =>
      node.props.testID === 'tooltip-arrow' && typeof node.type === 'string',
  );
}

function findScroll(testRenderer: renderer.ReactTestRenderer) {
  return testRenderer.root.findAllByProps({ testID: 'tooltip-scroll' })[0];
}

function layoutBubble(
  testRenderer: renderer.ReactTestRenderer,
  width: number,
  height: number,
) {
  act(() => {
    testRenderer.root.findAllByProps({ testID: 'tooltip-body' })[0].props.onLayout(
      { nativeEvent: { layout: { x: 0, y: 0, width, height } } },
    );
  });
}

describe('Tooltip', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the trigger but not the bubble when closed', () => {
    const testRenderer = renderTooltip();
    const tree = JSON.stringify(testRenderer.toJSON());

    expect(tree).toContain('Trigger');
    expect(findBubble(testRenderer)).toHaveLength(0);
  });

  it('renders the bubble when opened with defaultOpen', () => {
    const testRenderer = renderTooltip({ defaultOpen: true });

    expect(JSON.stringify(testRenderer.toJSON())).toContain(
      '按每月最后一天的余额合计',
    );
  });

  it('toggles the bubble from the trigger press in uncontrolled mode', () => {
    const testRenderer = renderTooltip();

    act(() => {
      testRenderer.root
        .findByProps({ testID: 'tooltip-trigger' })
        .props.onPress();
    });
    expect(findBubble(testRenderer)).toHaveLength(1);

    act(() => {
      testRenderer.root
        .findByProps({ testID: 'tooltip-trigger' })
        .props.onPress();
    });
    expect(findBubble(testRenderer)).toHaveLength(0);
  });

  it('opens on long press and closes on a tap when trigger is longPress', () => {
    const testRenderer = renderTooltip({ trigger: 'longPress' });
    const trigger = testRenderer.root.findByProps({
      testID: 'tooltip-trigger',
    });

    act(() => {
      trigger.props.onPress();
    });
    expect(findBubble(testRenderer)).toHaveLength(0);

    act(() => {
      trigger.props.onLongPress();
    });
    expect(findBubble(testRenderer)).toHaveLength(1);

    act(() => {
      trigger.props.onPress();
    });
    expect(findBubble(testRenderer)).toHaveLength(0);
  });

  it('does not wire trigger handlers when trigger is manual', () => {
    const testRenderer = renderTooltip({ trigger: 'manual' });

    expect(
      testRenderer.root.findAllByProps({ testID: 'tooltip-trigger' }),
    ).toHaveLength(0);
    expect(findBubble(testRenderer)).toHaveLength(0);
  });

  it('keeps the child handler while opening the bubble', () => {
    const childPress = jest.fn();
    let testRenderer: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(
        <Tooltip content="口径说明">
          <Pressable onPress={childPress} testID="custom-trigger">
            <RNText>Trigger</RNText>
          </Pressable>
        </Tooltip>,
      );
    });

    act(() => {
      testRenderer!.root
        .findAllByProps({ testID: 'custom-trigger' })[0]
        .props.onPress({ nativeEvent: {} });
    });

    expect(childPress).toHaveBeenCalledTimes(1);
    expect(findBubble(testRenderer!)).toHaveLength(1);
  });

  it('fires onCancel before onOpenChange when the outside is pressed', () => {
    const calls: string[] = [];
    const testRenderer = renderTooltip({
      defaultOpen: true,
      onCancel: params => calls.push(`cancel:${params.reason}`),
      onOpenChange: (open, params) =>
        calls.push(`open:${open}:${params.reason}`),
    });

    act(() => {
      testRenderer.root.findByProps({ testID: 'tooltip-mask' }).props.onPress();
    });

    expect(calls).toEqual(['cancel:outside', 'open:false:outside']);
  });

  it('does not self-close in controlled mode', () => {
    const onOpenChange = jest.fn();
    const testRenderer = renderTooltip({ open: true, onOpenChange });

    act(() => {
      testRenderer.root.findByProps({ testID: 'tooltip-mask' }).props.onPress();
    });

    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: 'outside' });
    expect(findBubble(testRenderer)).toHaveLength(1);
  });

  it('closes with the back reason on hardware back press', () => {
    const listeners: Array<() => boolean | null | undefined> = [];
    jest
      .spyOn(BackHandler, 'addEventListener')
      .mockImplementation(((event: string, handler: () => boolean) => {
        if (event === 'hardwareBackPress') {
          listeners.push(handler);
        }

        return {
          remove: () => {
            const index = listeners.indexOf(handler);
            if (index >= 0) {
              listeners.splice(index, 1);
            }
          },
        };
      }) as unknown as typeof BackHandler.addEventListener);
    const calls: string[] = [];
    renderTooltip({
      defaultOpen: true,
      onCancel: params => calls.push(`cancel:${params.reason}`),
      onOpenChange: (open, params) =>
        calls.push(`open:${open}:${params.reason}`),
    });

    act(() => {
      listeners[listeners.length - 1]();
    });

    expect(calls).toEqual(['cancel:back', 'open:false:back']);
  });

  it('renders no bubble for empty content', () => {
    const testRenderer = renderTooltip({ content: '', defaultOpen: true });

    expect(findBubble(testRenderer)).toHaveLength(0);
  });

  it('hides the arrow when arrow is false', () => {
    const withArrow = renderTooltip({ defaultOpen: true });
    expect(findArrows(withArrow)).toHaveLength(1);

    const withoutArrow = renderTooltip({ defaultOpen: true, arrow: false });
    expect(findArrows(withoutArrow)).toHaveLength(0);
  });

  it('measures the trigger and places the bubble above it', () => {
    const measureSpy = mockPosition({ x: 200, y: 700, width: 24, height: 24 });
    const testRenderer = renderTooltip({ defaultOpen: true });

    layoutBubble(testRenderer, 160, 40);

    const style = findBubbleStyle(testRenderer);
    expect(style.left).toBe(124);
    expect(style.top).toBe(644);
    measureSpy.mockRestore();
  });

  it('waits for a laid-out overlay before positioning', () => {
    const measureSpy = mockMeasurements([
      [200, 400, 24, 24],
      [0, 0, 0, 0],
      [200, 400, 24, 24],
      [0, 0, 400, 800],
    ]);
    const testRenderer = renderTooltip({ defaultOpen: true });

    layoutBubble(testRenderer, 160, 40);
    expect(findBubbleStyle(testRenderer).width).toBeUndefined();

    act(() => {
      testRenderer.root
        .findAllByProps({ testID: 'tooltip-overlay' })[0]
        .props.onLayout();
    });

    const style = findBubbleStyle(testRenderer);
    expect(style.left).toBe(124);
    expect(style.width).toBe(176);
    measureSpy.mockRestore();
  });

  it('positions the bubble relative to the overlay container', () => {
    const measureSpy = mockPosition(
      { x: 200, y: 800, width: 24, height: 24 },
      { x: 0, y: 100, width: 400, height: 800 },
    );
    const testRenderer = renderTooltip({ defaultOpen: true });

    layoutBubble(testRenderer, 160, 40);

    const style = findBubbleStyle(testRenderer);
    expect(style.left).toBe(124);
    expect(style.top).toBe(644);
    measureSpy.mockRestore();
  });

  it('caps the bubble height to whole lines and enables scrolling', () => {
    const measureSpy = mockPosition({ x: 200, y: 400, width: 24, height: 24 });
    const testRenderer = renderTooltip({ defaultOpen: true });

    layoutBubble(testRenderer, 160, 700);

    const bubbleStyle = findBubbleStyle(testRenderer);
    const scrollStyle = StyleSheet.flatten(findScroll(testRenderer).props.style);

    expect(bubbleStyle.top).toBe(24);
    expect(scrollStyle.maxHeight).toBe(360);
    expect(findScroll(testRenderer).props.scrollEnabled).toBe(true);
    measureSpy.mockRestore();
  });

  it('renders no scroll container when the content fits the side', () => {
    const measureSpy = mockPosition({ x: 200, y: 400, width: 24, height: 24 });
    const testRenderer = renderTooltip({ defaultOpen: true });

    layoutBubble(testRenderer, 160, 40);

    expect(
      testRenderer.root.findAllByProps({ testID: 'tooltip-scroll' }),
    ).toHaveLength(0);
    measureSpy.mockRestore();
  });
});
