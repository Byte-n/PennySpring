import React from 'react';
import {
  BackHandler,
  Pressable,
  StyleSheet,
  Text as RNText,
  View,
} from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Popover } from '../src/Popover';
import { PortalProvider } from '../src/Portal';

function renderPopover(
  props: Partial<React.ComponentProps<typeof Popover>> = {},
) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(
      <Popover content={<RNText>Popover content</RNText>} {...props}>
        <RNText>Trigger</RNText>
      </Popover>,
    );
  });
  return testRenderer!;
}

function findContent(testRenderer: renderer.ReactTestRenderer) {
  return testRenderer.root.findAll(
    node =>
      node.props.testID === 'popover-content' && typeof node.type === 'string',
  );
}

function spyOnMeasureInWindow(
  measure: (callback: (...params: number[]) => void) => void,
) {
  return jest
    .spyOn(
      View.prototype as unknown as {
        measureInWindow: (callback: (...params: number[]) => void) => void;
      },
      'measureInWindow',
    )
    .mockImplementation(measure);
}

describe('Popover', () => {
  it('renders the trigger but not the panel when closed', () => {
    const testRenderer = renderPopover();
    const tree = JSON.stringify(testRenderer.toJSON());

    expect(tree).toContain('Trigger');
    expect(findContent(testRenderer)).toHaveLength(0);
  });

  it('renders the panel when opened via defaultOpen', () => {
    const testRenderer = renderPopover({ defaultOpen: true });
    const tree = JSON.stringify(testRenderer.toJSON());

    expect(tree).toContain('Popover content');
  });

  it('toggles the panel from the trigger press in uncontrolled mode', () => {
    const testRenderer = renderPopover();

    act(() => {
      testRenderer.root
        .findByProps({ testID: 'popover-trigger' })
        .props.onPress();
    });
    expect(findContent(testRenderer)).toHaveLength(1);

    act(() => {
      testRenderer.root
        .findByProps({ testID: 'popover-trigger' })
        .props.onPress();
    });
    expect(findContent(testRenderer)).toHaveLength(0);
  });

  it('keeps the trigger handler on an interactive child while opening the panel', () => {
    const childPress = jest.fn();
    let testRenderer: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(
        <Popover content={<RNText>Popover content</RNText>}>
          <Pressable onPress={childPress} testID="custom-trigger">
            <RNText>Trigger</RNText>
          </Pressable>
        </Popover>,
      );
    });

    act(() => {
      testRenderer!.root
        .findAllByProps({ testID: 'custom-trigger' })[0]
        .props.onPress({
          nativeEvent: {},
        });
    });

    expect(childPress).toHaveBeenCalledTimes(1);
    expect(findContent(testRenderer!)).toHaveLength(1);
  });

  it('opens the panel from a long press when trigger is longPress', () => {
    const testRenderer = renderPopover({ trigger: 'longPress' });
    const trigger = testRenderer.root.findByProps({
      testID: 'popover-trigger',
    });

    act(() => {
      trigger.props.onLongPress();
    });

    expect(findContent(testRenderer)).toHaveLength(1);
  });

  it('fires onCancel before onOpenChange when the outside is pressed', () => {
    const calls: string[] = [];
    const testRenderer = renderPopover({
      defaultOpen: true,
      onCancel: params => calls.push(`cancel:${params.reason}`),
      onOpenChange: (open, params) =>
        calls.push(`open:${open}:${params.reason}`),
    });

    act(() => {
      testRenderer.root.findByProps({ testID: 'popover-mask' }).props.onPress();
    });

    expect(calls).toEqual(['cancel:outside', 'open:false:outside']);
  });

  it('does not close when closeOnMaskClick is false', () => {
    const onCancel = jest.fn();
    const testRenderer = renderPopover({
      defaultOpen: true,
      closeOnMaskClick: false,
      onCancel,
    });

    act(() => {
      testRenderer.root.findByProps({ testID: 'popover-mask' }).props.onPress();
    });

    expect(onCancel).not.toHaveBeenCalled();
    expect(findContent(testRenderer)).toHaveLength(1);
  });

  it('does not self-close in controlled mode when the outside is pressed', () => {
    const onOpenChange = jest.fn();
    const testRenderer = renderPopover({
      open: true,
      onOpenChange,
    });

    act(() => {
      testRenderer.root.findByProps({ testID: 'popover-mask' }).props.onPress();
    });

    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: 'outside' });
    expect(findContent(testRenderer)).toHaveLength(1);
  });

  it('closes with the back reason when the hardware back button is pressed', () => {
    const listeners: Array<() => boolean | null | undefined> = [];
    const addListenerSpy = jest
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
    renderPopover({
      defaultOpen: true,
      onCancel: params => calls.push(`cancel:${params.reason}`),
      onOpenChange: (open, params) =>
        calls.push(`open:${open}:${params.reason}`),
    });

    expect(listeners.length).toBeGreaterThan(0);
    act(() => {
      listeners[listeners.length - 1]();
    });

    expect(calls).toEqual(['cancel:back', 'open:false:back']);
    addListenerSpy.mockRestore();
  });

  it('measures the trigger and positions the panel next to it', () => {
    const measureSpy = spyOnMeasureInWindow(callback =>
      callback(200, 100, 24, 24),
    );
    const testRenderer = renderPopover({ defaultOpen: true });

    act(() => {
      testRenderer.root
        .findAllByProps({
          testID: 'popover-content',
        })[0]
        .props.onLayout({
          nativeEvent: { layout: { x: 0, y: 0, width: 160, height: 120 } },
        });
    });

    const contentStyle = StyleSheet.flatten(
      testRenderer.root.findAllByProps({ testID: 'popover-content' })[0].props
        .style,
    );

    expect(contentStyle.left).toBe(132);
    expect(contentStyle.top).toBe(132);
    measureSpy.mockRestore();
  });

  it('mounts the panel through a Portal when wrapped in a PortalProvider', () => {
    let testRenderer: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(
        <PortalProvider>
          <View testID="provider-host">
            <Popover open content={<RNText>Portaled popover</RNText>}>
              <RNText>Trigger</RNText>
            </Popover>
          </View>
        </PortalProvider>,
      );
    });

    const providerHost = testRenderer!.root.findByProps({
      testID: 'provider-host',
    });

    expect(
      providerHost.findAllByProps({ testID: 'popover-content' }),
    ).toHaveLength(0);
    expect(JSON.stringify(testRenderer!.toJSON())).toContain(
      'Portaled popover',
    );
  });

  it('throws when mountPoint is portal without a PortalProvider', () => {
    expect(() => {
      act(() => {
        renderer.create(
          <Popover
            open
            mountPoint="portal"
            content={<RNText>Portaled popover</RNText>}
          >
            <RNText>Trigger</RNText>
          </Popover>,
        );
      });
    }).toThrow('PortalProvider');
  });
});
