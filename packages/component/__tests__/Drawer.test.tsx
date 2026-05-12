import React from 'react';
import { Dimensions, Text as RNText, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Drawer } from '../src/Drawer';
import { PortalProvider } from '../src/Portal';
jest.mock('react-native-reanimated', () => {
  const ReactNative = require('react-native');
  return {
    __esModule: true,
    default: {
      View: ReactNative.View
    },
    Easing: {
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
function renderDrawer(props: Partial<React.ComponentProps<typeof Drawer>> = {}, children: React.ReactNode = <RNText>Drawer content</RNText>) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><Drawer {...props}>{children}</Drawer></>);
  });
  return testRenderer!;
}
describe('Drawer', () => {
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
  it('uses viewport width for percentage width in DrawerComponent', () => {
    const testRenderer = renderDrawer({
      mountPoint: 'local',
      open: false,
      width: '50%'
    });
    const drawerPanel = testRenderer.root.findByProps({
      testID: 'drawer-panel'
    });
    const drawerStyleList = drawerPanel.props.style as Array<Record<string, unknown>>;
    const transform = drawerStyleList[drawerStyleList.length - 1].transform as Array<{
      translateX: number;
    }>;
    expect(transform[0].translateX).toBe(-(Dimensions.get('window').width * 0.5));
  });
  it('uses main content width for percentage width in DrawerLayout', () => {
    let testRenderer: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(<><Drawer.Layout defaultOpen drawerType="slide" renderDrawerContent={() => <RNText>Layout drawer</RNText>} width="50%">
            <RNText>Main content</RNText>
          </Drawer.Layout></>);
    });
    const layoutContainer = testRenderer!.root.findByType(View);
    act(() => {
      layoutContainer.props.onLayout({
        nativeEvent: {
          layout: {
            width: 300,
            height: 100,
            x: 0,
            y: 0
          }
        }
      });
    });
    const sceneContainer = testRenderer!.root.findByProps({
      testID: 'drawer-layout-scene'
    });
    const sceneStyleList = sceneContainer.props.style as Array<Record<string, unknown>>;
    const transform = sceneStyleList[sceneStyleList.length - 1].transform as Array<{
      translateX: number;
    }>;
    expect(transform[0].translateX).toBe(150);
  });
});
