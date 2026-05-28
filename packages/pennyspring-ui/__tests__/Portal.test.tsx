import React from 'react';
import { Text, View } from 'react-native';
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

  it('does not expose hardcoded debug id on the overlay container', () => {
    const testRenderer = renderWithPortal(
      <View>
        <Portal>
          <Text>Portal content</Text>
        </Portal>
      </View>,
    );

    const allViews = testRenderer.root.findAllByType(View);
    const viewsWithId = allViews.filter(
      view => view.props.id !== undefined,
    );

    expect(viewsWithId).toHaveLength(0);
  });
});
