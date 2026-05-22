import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Portal, PortalProvider } from '../src/Portal';

function renderWithPortal(children: React.ReactNode) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(<PortalProvider>{children}</PortalProvider>);
  });

  return testRenderer!;
}

describe('Portal', () => {
  it('does not insert a layout wrapper around provider children', () => {
    const testRenderer = renderWithPortal(
      <View testID="provider-child">
        <Text>Provider child</Text>
      </View>,
    );
    const providerChild = testRenderer.root.findByProps({
      testID: 'provider-child',
    });
    const providerChildParent = providerChild.parent;

    expect(providerChildParent?.type).toBe(PortalProvider);
  });

  it('renders mounted portal content at the provider layer', () => {
    const testRenderer = renderWithPortal(
      <View>
        <Portal>
          <Text>Portal content</Text>
        </Portal>
      </View>,
    );
    const treeString = JSON.stringify(testRenderer.toJSON());

    expect(treeString).toContain('Portal content');
  });

  it('renders mounted portal content inside a viewport overlay host', () => {
    const testRenderer = renderWithPortal(
      <View>
        <Portal>
          <Text>Portal content</Text>
        </Portal>
      </View>,
    );
    const portalText = testRenderer.root.findByProps({
      children: 'Portal content',
    });
    const entryWrapper = portalText.parent;
    const host = entryWrapper?.parent;

    expect(host?.props.pointerEvents).toBe('box-none');
    expect(StyleSheet.flatten(host?.props.style)).toMatchObject({
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });
  });

  it('wraps each portal entry in an absoluteFill box-none container', () => {
    const testRenderer = renderWithPortal(
      <View>
        <Portal>
          <Text>Portal content</Text>
        </Portal>
      </View>,
    );
    const portalText = testRenderer.root.findByProps({
      children: 'Portal content',
    });
    const entryWrapper = portalText.parent;

    expect(entryWrapper?.props.pointerEvents).toBe('box-none');
    expect(StyleSheet.flatten(entryWrapper?.props.style)).toMatchObject({
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });
  });

  it('mounts absolute portal content under the provider overlay instead of a ScrollView content tree', () => {
    const testRenderer = renderWithPortal(
      <ScrollView testID="scroll-view">
        <View>
          <Portal>
            <View testID="absolute-portal-child" style={StyleSheet.absoluteFill}>
              <Text>Floating content</Text>
            </View>
          </Portal>
        </View>
      </ScrollView>,
    );
    const scrollView = testRenderer.root.findByProps({
      testID: 'scroll-view',
    });
    const portalChild = testRenderer.root.findByProps({
      testID: 'absolute-portal-child',
    });
    const entryWrapper = portalChild.parent;
    const host = entryWrapper?.parent;
    const portalAncestors: renderer.ReactTestInstance[] = [];
    let currentParent = portalChild.parent;

    while (currentParent) {
      portalAncestors.push(currentParent);
      currentParent = currentParent.parent;
    }

    expect(portalAncestors).not.toContain(scrollView);
    expect(host?.props.pointerEvents).toBe('box-none');
    expect(StyleSheet.flatten(host?.props.style)).toMatchObject({
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });
    expect(entryWrapper?.props.pointerEvents).toBe('box-none');
    expect(StyleSheet.flatten(entryWrapper?.props.style)).toMatchObject({
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });
  });

  it('renders multiple portals in mount order', () => {
    const testRenderer = renderWithPortal(
      <View>
        <Portal>
          <Text>First portal</Text>
        </Portal>
        <Portal>
          <Text>Second portal</Text>
        </Portal>
      </View>,
    );
    const treeString = JSON.stringify(testRenderer.toJSON());

    expect(treeString.indexOf('First portal')).toBeLessThan(
      treeString.indexOf('Second portal'),
    );
  });

  it('updates rendered portal content when children change', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <PortalProvider>
          <Portal>
            <Text>Initial portal</Text>
          </Portal>
        </PortalProvider>,
      );
    });

    act(() => {
      testRenderer.update(
        <PortalProvider>
          <Portal>
            <Text>Updated portal</Text>
          </Portal>
        </PortalProvider>,
      );
    });

    const treeString = JSON.stringify(testRenderer!.toJSON());

    expect(treeString).not.toContain('Initial portal');
    expect(treeString).toContain('Updated portal');
  });

  it('removes rendered portal content when the portal unmounts', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <PortalProvider>
          <Portal>
            <Text>Temporary portal</Text>
          </Portal>
        </PortalProvider>,
      );
    });

    act(() => {
      testRenderer.update(<PortalProvider />);
    });

    const treeString = JSON.stringify(testRenderer!.toJSON());

    expect(treeString).not.toContain('Temporary portal');
  });

  it('throws when rendered without a provider', () => {
    expect(() => {
      act(() => {
        renderer.create(
          <Portal>
            <Text>Missing provider</Text>
          </Portal>,
        );
      });
    }).toThrow('PortalProvider');
  });
});
