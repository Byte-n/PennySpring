import React from 'react';
import { Text as RNText, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Drawer } from '../src/Drawer';
import { PortalProvider } from '../src/Portal';
jest.mock('react-native-reanimated', () => {
  const ReactNative = require('react-native');
  return {
    __esModule: true,
    default: {
      createAnimatedComponent: <T,>(component: T) => component,
      View: ReactNative.View
    },
    Easing: {
      bezier: () => 'bezier',
      cubic: 'cubic',
      out: (value: unknown) => value
    },
    createAnimatedComponent: <T,>(component: T) => component,
    interpolate: (value: number, input: [number, number], output: [number, number]) => {
      const [inputStart, inputEnd] = input;
      const [outputStart, outputEnd] = output;
      if (inputEnd === inputStart) {
        return outputStart;
      }
      const ratio = (value - inputStart) / (inputEnd - inputStart);
      return outputStart + (outputEnd - outputStart) * ratio;
    },
    useAnimatedStyle: (updater: () => Record<string, unknown>) => updater(),
    useSharedValue: (value: number) => ({
      value
    }),
    withDelay: (_delay: number, value: number) => value,
    withTiming: (value: number) => value
  };
});
jest.mock('react-native-gesture-handler', () => {
  const ReactLocal = require('react');
  const createPanGesture = () => {
    const gesture = {
      enabled: () => gesture,
      runOnJS: () => gesture,
      minDistance: () => gesture,
      activeOffsetX: () => gesture,
      failOffsetY: () => gesture,
      onUpdate: () => gesture,
      onEnd: () => gesture,
      onFinalize: () => gesture
    };
    return gesture;
  };
  return {
    Gesture: {
      Pan: createPanGesture
    },
    GestureDetector: ({
      children
    }: {
      children: React.ReactNode;
    }) => ReactLocal.createElement(ReactLocal.Fragment, undefined, children)
  };
});

function getPointerEvents(testRenderer: renderer.ReactTestRenderer) {
  return testRenderer.root.findByProps({
    testID: 'drawer-overlay-container'
  }).props.pointerEvents;
}

function renderDrawer(props: Partial<React.ComponentProps<typeof Drawer>> = {}, children: React.ReactNode = <RNText>Drawer content</RNText>) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><Drawer {...props}>{children}</Drawer></>);
  });
  return testRenderer!;
}
describe('Drawer', () => {
  it('opens initially when defaultOpen is true', () => {
    // Arrange & Act
    const testRenderer = renderDrawer({
      defaultOpen: true
    });

    // Assert
    expect(getPointerEvents(testRenderer)).toBe('auto');
    expect(JSON.stringify(testRenderer.toJSON())).toContain('Drawer content');
  });

  it('fires onCancel before onOpenChange when the overlay is pressed', () => {
    // Arrange
    const calls: string[] = [];
    const testRenderer = renderDrawer({
      defaultOpen: true,
      onCancel: () => calls.push('cancel'),
      onOpenChange: nextOpen => calls.push(`open:${nextOpen}`)
    });

    // Act
    act(() => {
      testRenderer.root.findByProps({
        testID: 'drawer-overlay'
      }).props.onPress();
    });

    // Assert
    expect(calls).toEqual(['cancel', 'open:false']);
    expect(getPointerEvents(testRenderer)).toBe('none');
  });

  it('keeps a controlled drawer visible when the overlay requests close', () => {
    // Arrange
    const onOpenChange = jest.fn();
    const testRenderer = renderDrawer({
      open: true,
      onOpenChange
    });

    // Act
    act(() => {
      testRenderer.root.findByProps({
        testID: 'drawer-overlay'
      }).props.onPress();
    });

    // Assert
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(getPointerEvents(testRenderer)).toBe('auto');
  });

  it('fires onCancel before onOpenChange when the layout back mask is pressed', () => {
    // Arrange
    const calls: string[] = [];
    let testRenderer: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(<><Drawer.Layout
            defaultOpen
            drawerType="back"
            onCancel={() => calls.push('cancel')}
            onOpenChange={nextOpen => calls.push(`open:${nextOpen}`)}
            renderDrawerContent={() => <RNText>Layout drawer</RNText>}
          >
            <RNText>Scene content</RNText>
          </Drawer.Layout></>);
    });

    // Act
    act(() => {
      testRenderer!.root.findByProps({
        testID: 'drawer-layout-back-mask'
      }).props.onPress();
    });

    // Assert
    expect(calls).toEqual(['cancel', 'open:false']);
  });

  it('uses reanimated to create the web animated pressable', () => {
    // Arrange & Act
    const source = require('fs').readFileSync(
      'packages/pennyspring-ui/src/Drawer/AnimatedPressable.web.ts',
      'utf8',
    );

    // Assert
    expect(source).toContain("from 'react-native-reanimated'");
    expect(source).not.toContain('Animated.createAnimatedComponent');
  });

  it('mounts content through a Portal when wrapped in a PortalProvider', () => {
    let testRenderer: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(<><PortalProvider>
            <View testID="provider-host">
              <Drawer open>
                <RNText>Portaled drawer</RNText>
              </Drawer>
            </View>
          </PortalProvider></>);
    });
    const providerHost = testRenderer!.root.findByProps({
      testID: 'provider-host'
    });
    const drawerOverlay = testRenderer!.root.findByProps({
      testID: 'drawer-overlay-container'
    });
    const hostDescendants = providerHost.findAllByProps({
      testID: 'drawer-overlay-container'
    });
    expect(hostDescendants).toHaveLength(0);
    expect(JSON.stringify(testRenderer!.toJSON())).toContain('Portaled drawer');
    expect(drawerOverlay).toBeTruthy();
  });
  it('keeps content local when mountPoint is local inside a PortalProvider', () => {
    let testRenderer: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(<><PortalProvider>
            <View testID="provider-host">
              <Drawer mountPoint="local" open>
                <RNText>Local drawer</RNText>
              </Drawer>
            </View>
          </PortalProvider></>);
    });
    const providerHost = testRenderer!.root.findByProps({
      testID: 'provider-host'
    });
    const drawerOverlay = testRenderer!.root.findByProps({
      testID: 'drawer-overlay-container'
    });
    const ancestors: renderer.ReactTestInstance[] = [];
    let current = drawerOverlay.parent;
    while (current) {
      ancestors.push(current);
      current = current.parent;
    }
    expect(ancestors).toContain(providerHost);
  });
  it('throws when mountPoint is portal without a PortalProvider', () => {
    expect(() => {
      renderDrawer({
        mountPoint: 'portal',
        open: true
      });
    }).toThrow('PortalProvider');
  });
});
