import React from 'react';
import { BackHandler, StyleSheet, Text as RNText, View } from 'react-native';
import { ThemeProvider } from '@pennyspring/theme';
import renderer, { act } from 'react-test-renderer';
import { Popup } from '../src/Popup';
import { PortalProvider } from '../src/Portal';
function renderPopup(props: Partial<React.ComponentProps<typeof Popup>> = {}, children: React.ReactNode = <RNText>Popup content</RNText>) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><Popup {...props}>{children}</Popup></>);
  });
  return testRenderer!;
}
describe('Popup', () => {
  it('does not render anything when closed', () => {
    const testRenderer = renderPopup();
    const tree = testRenderer.toJSON();
    expect(tree).toBeNull();
  });
  it('renders children when opened via defaultOpen', () => {
    const testRenderer = renderPopup({
      defaultOpen: true
    });
    const tree = JSON.stringify(testRenderer.toJSON());
    expect(tree).toContain('Popup content');
  });
  it('renders children when controlled open is true', () => {
    const testRenderer = renderPopup({
      open: true
    });
    const tree = JSON.stringify(testRenderer.toJSON());
    expect(tree).toContain('Popup content');
  });
  it('fires onCancel before onOpenChange when the mask is pressed', () => {
    const calls: string[] = [];
    const testRenderer = renderPopup({
      defaultOpen: true,
      onCancel: params => calls.push(`cancel:${params.reason}`),
      onOpenChange: (nextOpen, params) => calls.push(`open:${nextOpen}:${params.reason}`)
    });
    act(() => {
      testRenderer.root.findByProps({
        testID: 'popup-mask'
      }).props.onPress();
    });
    expect(calls).toEqual(['cancel:mask', 'open:false:mask']);
  });
  it('closes in uncontrolled mode when the mask is pressed', () => {
    const testRenderer = renderPopup({
      defaultOpen: true
    });
    act(() => {
      testRenderer.root.findByProps({
        testID: 'popup-mask'
      }).props.onPress();
    });
    expect(testRenderer.toJSON()).toBeNull();
  });
  it('does not self-close in controlled mode when the mask is pressed', () => {
    const onOpenChange = jest.fn();
    const testRenderer = renderPopup({
      open: true,
      onOpenChange
    });
    act(() => {
      testRenderer.root.findByProps({
        testID: 'popup-mask'
      }).props.onPress();
    });
    expect(onOpenChange).toHaveBeenCalledWith(false, {
      reason: 'mask'
    });
    expect(JSON.stringify(testRenderer.toJSON())).toContain('Popup content');
  });
  it('does not emit onCancel when the parent closes a controlled popup externally', () => {
    const onCancel = jest.fn();
    const onOpenChange = jest.fn();
    let testRenderer: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(<><Popup open onCancel={onCancel} onOpenChange={onOpenChange}>
            <RNText>Popup content</RNText>
          </Popup></>);
    });
    act(() => {
      testRenderer!.update(<><Popup open={false} onCancel={onCancel} onOpenChange={onOpenChange}>
            <RNText>Popup content</RNText>
          </Popup></>);
    });
    expect(onCancel).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });
  it('fires onCancel with back reason when the hardware back button is pressed', () => {
    const listeners: Array<() => boolean | null | undefined> = [];
    const addListenerSpy = jest.spyOn(BackHandler, 'addEventListener').mockImplementation(((event: string, handler: () => boolean) => {
      if (event === 'hardwareBackPress') {
        listeners.push(handler);
      }
      return {
        remove: () => {
          const index = listeners.indexOf(handler);
          if (index >= 0) {
            listeners.splice(index, 1);
          }
        }
      };
    }) as unknown as typeof BackHandler.addEventListener);
    const calls: string[] = [];
    renderPopup({
      defaultOpen: true,
      onCancel: params => calls.push(`cancel:${params.reason}`),
      onOpenChange: (nextOpen, params) => calls.push(`open:${nextOpen}:${params.reason}`)
    });
    expect(listeners.length).toBeGreaterThan(0);
    act(() => {
      listeners[listeners.length - 1]();
    });
    expect(calls).toEqual(['cancel:back', 'open:false:back']);
    addListenerSpy.mockRestore();
  });
  it('omits the mask when mask is false', () => {
    const testRenderer = renderPopup({
      defaultOpen: true,
      mask: false
    });
    expect(() => testRenderer.root.findByProps({
      testID: 'popup-mask'
    })).toThrow();
  });
  it('does not close when closeOnMaskClick is false', () => {
    const onCancel = jest.fn();
    const testRenderer = renderPopup({
      defaultOpen: true,
      closeOnMaskClick: false,
      onCancel
    });
    act(() => {
      testRenderer.root.findByProps({
        testID: 'popup-mask'
      }).props.onPress();
    });
    expect(onCancel).not.toHaveBeenCalled();
    expect(JSON.stringify(testRenderer.toJSON())).toContain('Popup content');
  });
  it('renders arbitrary children as-is', () => {
    const testRenderer = renderPopup({
      defaultOpen: true
    }, <View testID="custom-child">
        <RNText>Custom child</RNText>
      </View>);
    expect(testRenderer.root.findByProps({
      testID: 'custom-child'
    })).toBeTruthy();
  });
  it('renders content inline when no PortalProvider is present', () => {
    const testRenderer = renderPopup({
      defaultOpen: true
    });
    const layout = testRenderer.root.findByProps({
      testID: 'popup-layout'
    });
    const ancestors: renderer.ReactTestInstance[] = [];
    let current = layout.parent;
    while (current) {
      ancestors.push(current);
      current = current.parent;
    }
    const ancestorTypes = ancestors.map(ancestor => ancestor.type);
    expect(ancestorTypes).not.toContain(PortalProvider);
  });
  it('mounts content through a Portal when wrapped in a PortalProvider', () => {
    let testRenderer: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(<><PortalProvider>
            <View testID="provider-host">
              <Popup open>
                <RNText>Portaled popup</RNText>
              </Popup>
            </View>
          </PortalProvider></>);
    });
    const providerHost = testRenderer!.root.findByProps({
      testID: 'provider-host'
    });
    const popupLayout = testRenderer!.root.findByProps({
      testID: 'popup-layout'
    });
    const hostDescendants = providerHost.findAllByProps({
      testID: 'popup-layout'
    });
    expect(hostDescendants).toHaveLength(0);
    expect(JSON.stringify(testRenderer!.toJSON())).toContain('Portaled popup');
    expect(popupLayout).toBeTruthy();
  });
  it('keeps content local when mountPoint is local inside a PortalProvider', () => {
    let testRenderer: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(<><PortalProvider>
            <View testID="provider-host">
              <Popup open mountPoint="local">
                <RNText>Local popup</RNText>
              </Popup>
            </View>
          </PortalProvider></>);
    });
    const providerHost = testRenderer!.root.findByProps({
      testID: 'provider-host'
    });
    const popupLayout = testRenderer!.root.findByProps({
      testID: 'popup-layout'
    });
    const ancestors: renderer.ReactTestInstance[] = [];
    let current = popupLayout.parent;
    while (current) {
      ancestors.push(current);
      current = current.parent;
    }
    expect(ancestors).toContain(providerHost);
  });
  it('throws when mountPoint is portal without a PortalProvider', () => {
    expect(() => {
      act(() => {
        renderer.create(<><Popup open mountPoint="portal">
              <RNText>Portaled popup</RNText>
            </Popup></>);
      });
    }).toThrow('PortalProvider');
  });
  it('uses zIndexPopupBase + 100 without stacking zIndexBase', () => {
    let testRenderer: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(
        <ThemeProvider
          config={{
            token: {
              zIndexBase: 10,
              zIndexPopupBase: 1000,
            },
          }}
        >
          <Popup open>
            <RNText>Popup content</RNText>
          </Popup>
        </ThemeProvider>,
      );
    });
    const layout = testRenderer!.root.findByProps({
      testID: 'popup-layout',
    });
    const flattenedStyle = StyleSheet.flatten(layout.props.style);
    expect(flattenedStyle.zIndex).toBe(1100);
  });
});
