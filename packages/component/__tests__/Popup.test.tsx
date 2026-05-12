import React from 'react';
import { BackHandler, Text as RNText, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { defaultSeedToken } from '@pennyspring/theme';
import { derivative } from '@pennyspring/theme/src/algorithms/derivative';
import { formatToken } from '@pennyspring/theme/src/algorithms/formatToken';
import { Popup } from '../src/Popup';
import { PortalProvider } from '../src/Portal';

const token = formatToken(derivative(defaultSeedToken, false));

function flattenStyle(style: unknown) {
  const flatten = (input: unknown): Record<string, unknown>[] => {
    if (input === null || input === undefined || input === false) {
      return [];
    }

    if (Array.isArray(input)) {
      return input.flatMap(flatten);
    }

    return [input as Record<string, unknown>];
  };

  return Object.assign({}, ...flatten(style));
}

function renderPopup(
  props: Partial<React.ComponentProps<typeof Popup>> = {},
  children: React.ReactNode = <RNText>Popup content</RNText>,
) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <ThemeProvider>
        <Popup {...props}>{children}</Popup>
      </ThemeProvider>,
    );
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
    const testRenderer = renderPopup({ defaultOpen: true });
    const tree = JSON.stringify(testRenderer.toJSON());

    expect(tree).toContain('Popup content');
  });

  it('renders children when controlled open is true', () => {
    const testRenderer = renderPopup({ open: true });
    const tree = JSON.stringify(testRenderer.toJSON());

    expect(tree).toContain('Popup content');
  });

  it('fires onCancel before onOpenChange when the mask is pressed', () => {
    const calls: string[] = [];
    const testRenderer = renderPopup({
      defaultOpen: true,
      onCancel: params => calls.push(`cancel:${params.reason}`),
      onOpenChange: (nextOpen, params) =>
        calls.push(`open:${nextOpen}:${params.reason}`),
    });

    act(() => {
      testRenderer.root.findByProps({ testID: 'popup-mask' }).props.onPress();
    });

    expect(calls).toEqual(['cancel:mask', 'open:false:mask']);
  });

  it('closes in uncontrolled mode when the mask is pressed', () => {
    const testRenderer = renderPopup({ defaultOpen: true });

    act(() => {
      testRenderer.root.findByProps({ testID: 'popup-mask' }).props.onPress();
    });

    expect(testRenderer.toJSON()).toBeNull();
  });

  it('does not self-close in controlled mode when the mask is pressed', () => {
    const onOpenChange = jest.fn();
    const testRenderer = renderPopup({ open: true, onOpenChange });

    act(() => {
      testRenderer.root.findByProps({ testID: 'popup-mask' }).props.onPress();
    });

    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: 'mask' });
    expect(JSON.stringify(testRenderer.toJSON())).toContain('Popup content');
  });

  it('does not emit onCancel when the parent closes a controlled popup externally', () => {
    const onCancel = jest.fn();
    const onOpenChange = jest.fn();
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ThemeProvider>
          <Popup open onCancel={onCancel} onOpenChange={onOpenChange}>
            <RNText>Popup content</RNText>
          </Popup>
        </ThemeProvider>,
      );
    });

    act(() => {
      testRenderer!.update(
        <ThemeProvider>
          <Popup open={false} onCancel={onCancel} onOpenChange={onOpenChange}>
            <RNText>Popup content</RNText>
          </Popup>
        </ThemeProvider>,
      );
    });

    expect(onCancel).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('fires onCancel with back reason when the hardware back button is pressed', () => {
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
    renderPopup({
      defaultOpen: true,
      onCancel: params => calls.push(`cancel:${params.reason}`),
      onOpenChange: (nextOpen, params) =>
        calls.push(`open:${nextOpen}:${params.reason}`),
    });

    expect(listeners.length).toBeGreaterThan(0);

    act(() => {
      listeners[listeners.length - 1]();
    });

    expect(calls).toEqual(['cancel:back', 'open:false:back']);

    addListenerSpy.mockRestore();
  });

  it('omits the mask when mask is false', () => {
    const testRenderer = renderPopup({ defaultOpen: true, mask: false });

    expect(() =>
      testRenderer.root.findByProps({ testID: 'popup-mask' }),
    ).toThrow();
  });

  it('does not close when closeOnMaskClick is false', () => {
    const onCancel = jest.fn();
    const testRenderer = renderPopup({
      defaultOpen: true,
      closeOnMaskClick: false,
      onCancel,
    });

    act(() => {
      testRenderer.root.findByProps({ testID: 'popup-mask' }).props.onPress();
    });

    expect(onCancel).not.toHaveBeenCalled();
    expect(JSON.stringify(testRenderer.toJSON())).toContain('Popup content');
  });

  it('uses elevated surface and mask colors from theme tokens', () => {
    const testRenderer = renderPopup({ defaultOpen: true });
    const body = flattenStyle(
      testRenderer.root.findByProps({ testID: 'popup-body' }).props.style,
    );
    const mask = flattenStyle(
      testRenderer.root.findByProps({ testID: 'popup-mask' }).props.style,
    );

    expect(body.backgroundColor).toBe(token.colorBgElevated);
    expect(mask.backgroundColor).toBe(token.colorBgMask);
  });

  it('places the body at the bottom of the layout by default', () => {
    const testRenderer = renderPopup({ defaultOpen: true });
    const layout = flattenStyle(
      testRenderer.root.findByProps({ testID: 'popup-layout' }).props.style,
    );

    expect(layout.justifyContent).toBe('flex-end');
    expect(layout.position).toBe('absolute');
  });

  it('aligns the body based on the selected position', () => {
    const top = renderPopup({ defaultOpen: true, position: 'top' });
    const center = renderPopup({ defaultOpen: true, position: 'center' });
    const left = renderPopup({ defaultOpen: true, position: 'left' });
    const right = renderPopup({ defaultOpen: true, position: 'right' });

    expect(
      flattenStyle(
        top.root.findByProps({ testID: 'popup-layout' }).props.style,
      ).justifyContent,
    ).toBe('flex-start');
    expect(
      flattenStyle(
        center.root.findByProps({ testID: 'popup-layout' }).props.style,
      ).justifyContent,
    ).toBe('center');
    expect(
      flattenStyle(
        left.root.findByProps({ testID: 'popup-layout' }).props.style,
      ).flexDirection,
    ).toBe('row');
    expect(
      flattenStyle(
        right.root.findByProps({ testID: 'popup-layout' }).props.style,
      ).justifyContent,
    ).toBe('flex-end');
  });

  it('merges external styles over token defaults for mask and body slots', () => {
    const testRenderer = renderPopup({
      defaultOpen: true,
      styles: {
        body: { opacity: 0.88 },
        mask: { opacity: 0.77 },
      },
    });
    const body = flattenStyle(
      testRenderer.root.findByProps({ testID: 'popup-body' }).props.style,
    );
    const mask = flattenStyle(
      testRenderer.root.findByProps({ testID: 'popup-mask' }).props.style,
    );

    expect(body.opacity).toBe(0.88);
    expect(mask.opacity).toBe(0.77);
  });

  it('applies external style to the root layout', () => {
    const testRenderer = renderPopup({
      defaultOpen: true,
      style: { opacity: 0.55 },
    });
    const layout = flattenStyle(
      testRenderer.root.findByProps({ testID: 'popup-layout' }).props.style,
    );

    expect(layout.opacity).toBe(0.55);
  });

  it('renders arbitrary children as-is', () => {
    const testRenderer = renderPopup(
      { defaultOpen: true },
      <View testID="custom-child">
        <RNText>Custom child</RNText>
      </View>,
    );

    expect(
      testRenderer.root.findByProps({ testID: 'custom-child' }),
    ).toBeTruthy();
  });

  it('renders content inline when no PortalProvider is present', () => {
    const testRenderer = renderPopup({ defaultOpen: true });
    const layout = testRenderer.root.findByProps({ testID: 'popup-layout' });
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
      testRenderer = renderer.create(
        <ThemeProvider>
          <PortalProvider>
            <View testID="provider-host">
              <Popup open>
                <RNText>Portaled popup</RNText>
              </Popup>
            </View>
          </PortalProvider>
        </ThemeProvider>,
      );
    });

    const providerHost = testRenderer!.root.findByProps({
      testID: 'provider-host',
    });
    const popupLayout = testRenderer!.root.findByProps({
      testID: 'popup-layout',
    });
    const hostDescendants = providerHost.findAllByProps({
      testID: 'popup-layout',
    });

    expect(hostDescendants).toHaveLength(0);
    expect(JSON.stringify(testRenderer!.toJSON())).toContain('Portaled popup');
    expect(popupLayout).toBeTruthy();
  });

  it('keeps content local when mountPoint is local inside a PortalProvider', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ThemeProvider>
          <PortalProvider>
            <View testID="provider-host">
              <Popup open mountPoint="local">
                <RNText>Local popup</RNText>
              </Popup>
            </View>
          </PortalProvider>
        </ThemeProvider>,
      );
    });

    const providerHost = testRenderer!.root.findByProps({
      testID: 'provider-host',
    });
    const popupLayout = testRenderer!.root.findByProps({
      testID: 'popup-layout',
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
        renderer.create(
          <ThemeProvider>
            <Popup open mountPoint="portal">
              <RNText>Portaled popup</RNText>
            </Popup>
          </ThemeProvider>,
        );
      });
    }).toThrow('PortalProvider');
  });
});
