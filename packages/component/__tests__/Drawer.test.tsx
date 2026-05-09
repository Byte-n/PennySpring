import React from 'react';
import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { defaultSeedToken } from '@pennyspring/theme';
import { derivative } from '@pennyspring/theme/src/algorithms/derivative';
import { formatToken } from '@pennyspring/theme/src/algorithms/formatToken';
import { Drawer } from '../src/Drawer';
import { PortalProvider } from '../src/Portal';

const DrawerLayout = Drawer.Layout;
const token = formatToken(derivative(defaultSeedToken, false));
const changedToken = formatToken(
  derivative(
    {
      ...defaultSeedToken,
      colorPrimary: '#ff4d4f',
    },
    false,
  ),
);

const mockDrawer = jest.fn(({ children, renderDrawerContent }) => (
  <>
    {renderDrawerContent()}
    {children}
  </>
));

jest.mock('react-native-drawer-layout', () => ({
  Drawer: (props: Record<string, unknown>) => mockDrawer(props),
}));

function renderDrawer(props: Partial<React.ComponentProps<typeof DrawerLayout>> = {}) {
  const onOpen = jest.fn();
  const onClose = jest.fn();
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <ThemeProvider>
        <DrawerLayout
          onClose={onClose}
          onOpen={onOpen}
          open
          renderDrawerContent={() => <Text>Drawer content</Text>}
          {...props}
        >
          <Text>Main content</Text>
        </DrawerLayout>
      </ThemeProvider>,
    );
  });

  return {
    onClose,
    onOpen,
    props: mockDrawer.mock.calls[mockDrawer.mock.calls.length - 1][0],
    testRenderer: testRenderer!,
  };
}

function flattenStyle(style: unknown) {
  const styles = Array.isArray(style) ? style : [style];

  return Object.assign({}, ...styles);
}

describe('Drawer', () => {
  beforeEach(() => {
    mockDrawer.mockClear();
  });

  it('passes controlled open and close props to react-native-drawer-layout', () => {
    const onOpen = jest.fn();
    const onClose = jest.fn();
    const { props } = renderDrawer({ open: false, onOpen, onClose });

    expect(props.open).toBe(false);
    expect(props.onOpen).toBe(onOpen);
    expect(props.onClose).toBe(onClose);
  });

  it('renders supplied drawer content and children', () => {
    const { testRenderer } = renderDrawer();
    const treeString = JSON.stringify(testRenderer.toJSON());

    expect(treeString).toContain('Drawer content');
    expect(treeString).toContain('Main content');
  });

  it('applies numeric width to the drawer style', () => {
    const { props } = renderDrawer({ width: 320 });
    const style = flattenStyle(props.drawerStyle);

    expect(style.width).toBe(320);
  });

  it('applies string width to the drawer style', () => {
    const { props } = renderDrawer({ width: '72%' });
    const style = flattenStyle(props.drawerStyle);

    expect(style.width).toBe('72%');
  });

  it('applies default drawer width when width is omitted', () => {
    const { props } = renderDrawer();
    const style = flattenStyle(props.drawerStyle);

    expect(style.width).toBe('70%');
  });

  it('uses token-derived drawer surface defaults', () => {
    const { props } = renderDrawer();
    const style = flattenStyle(props.drawerStyle);

    expect(style.backgroundColor).toBe(token.colorBgElevated);
    expect(style.padding).toBe(token.paddingLG);
  });

  it('uses token-derived overlay defaults', () => {
    const { props } = renderDrawer();
    const style = flattenStyle(props.overlayStyle);

    expect(style.backgroundColor).toBe(token.colorBgMask);
  });

  it('maps public style slots to the underlying drawer layout props', () => {
    const containerStyle = { flex: 1 };
    const drawerStyle = { padding: 0 };
    const overlayStyle = {
      backgroundColor: 'rgba(1, 2, 3, 0.4)',
      opacity: 0.5,
    };
    const { props } = renderDrawer({
      styles: {
        container: containerStyle,
        drawer: drawerStyle,
        overlay: overlayStyle,
      },
    });
    const mappedDrawerStyle = flattenStyle(props.drawerStyle);
    const mappedOverlayStyle = flattenStyle(props.overlayStyle);

    expect(mappedDrawerStyle.padding).toBe(0);
    expect(props.style).toBe(containerStyle);
    expect(mappedOverlayStyle.backgroundColor).toBe(
      overlayStyle.backgroundColor,
    );
    expect(mappedOverlayStyle.opacity).toBe(overlayStyle.opacity);
    expect(props.styles).toBeUndefined();
  });

  it('updates drawer surface defaults when theme tokens change', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ThemeProvider>
          <DrawerLayout
            onClose={jest.fn()}
            onOpen={jest.fn()}
            open
            renderDrawerContent={() => <Text>Drawer content</Text>}
          >
            <Text>Main content</Text>
          </DrawerLayout>
        </ThemeProvider>,
      );
    });

    act(() => {
      testRenderer.update(
        <ThemeProvider config={{ token: { colorPrimary: '#ff4d4f' } }}>
          <DrawerLayout
            onClose={jest.fn()}
            onOpen={jest.fn()}
            open
            renderDrawerContent={() => <Text>Drawer content</Text>}
          >
            <Text>Main content</Text>
          </DrawerLayout>
        </ThemeProvider>,
      );
    });

    const props = mockDrawer.mock.calls[mockDrawer.mock.calls.length - 1][0];
    const style = flattenStyle(props.drawerStyle);
    const overlayStyle = flattenStyle(props.overlayStyle);

    expect(style.backgroundColor).toBe(changedToken.colorBgElevated);
    expect(style.padding).toBe(changedToken.paddingLG);
    expect(overlayStyle.backgroundColor).toBe(changedToken.colorBgMask);
    expect(testRenderer!).toBeDefined();
  });

  it('mounts through a Portal by default when wrapped in a PortalProvider', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ThemeProvider>
          <PortalProvider>
            <Text testID="provider-host">
              <DrawerLayout
                onClose={jest.fn()}
                onOpen={jest.fn()}
                open
                renderDrawerContent={() => <Text>Drawer content</Text>}
              >
                <Text>Main content</Text>
              </DrawerLayout>
            </Text>
          </PortalProvider>
        </ThemeProvider>,
      );
    });

    const providerHost = testRenderer!.root.findByProps({
      testID: 'provider-host',
    });
    const hostDescendants = providerHost.findAllByProps({
      children: 'Drawer content',
    });

    expect(hostDescendants).toHaveLength(0);
  });

  it('keeps content local when mountPoint is local inside a PortalProvider', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ThemeProvider>
          <PortalProvider>
            <Text testID="provider-host">
              <DrawerLayout
                mountPoint="local"
                onClose={jest.fn()}
                onOpen={jest.fn()}
                open
                renderDrawerContent={() => <Text>Drawer content</Text>}
              >
                <Text>Main content</Text>
              </DrawerLayout>
            </Text>
          </PortalProvider>
        </ThemeProvider>,
      );
    });

    const providerHost = testRenderer!.root.findByProps({
      testID: 'provider-host',
    });
    const drawerContent = testRenderer!.root.findByProps({
      children: 'Drawer content',
    });
    const ancestors: renderer.ReactTestInstance[] = [];
    let current = drawerContent.parent;
    const drawerProps = mockDrawer.mock.calls[mockDrawer.mock.calls.length - 1][0];

    while (current) {
      ancestors.push(current);
      current = current.parent;
    }

    expect(ancestors).toContain(providerHost);
    expect(drawerProps.mountPoint).toBeUndefined();
  });

  it('throws when mountPoint is portal without a PortalProvider', () => {
    expect(() => {
      act(() => {
        renderer.create(
          <ThemeProvider>
            <DrawerLayout
              mountPoint="portal"
              onClose={jest.fn()}
              onOpen={jest.fn()}
              open
              renderDrawerContent={() => <Text>Drawer content</Text>}
            >
              <Text>Main content</Text>
            </DrawerLayout>
          </ThemeProvider>,
        );
      });
    }).toThrow('PortalProvider');
  });
});
