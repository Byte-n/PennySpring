import React from 'react';
import { Text as RNText, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Dialog } from '../src/Dialog';
import { Popup } from '../src/Popup';
import { PortalProvider } from '../src/Portal';
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
function renderDialog(props: Partial<React.ComponentProps<typeof Dialog>> = {}, children: React.ReactNode = <RNText>Dialog content</RNText>) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><Dialog {...props}>{children}</Dialog></>);
  });
  return testRenderer!;
}
function renderPopup(props: Partial<React.ComponentProps<typeof Popup>> = {}, children: React.ReactNode = <RNText>Popup content</RNText>) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><Popup {...props}>{children}</Popup></>);
  });
  return testRenderer!;
}
describe('Dialog', () => {
  it('does not render anything when closed', () => {
    const testRenderer = renderDialog();
    expect(testRenderer.toJSON()).toBeNull();
  });
  it('renders title content and default actions when opened', () => {
    const testRenderer = renderDialog({
      defaultOpen: true,
      titleText: 'Delete transaction'
    });
    const treeString = JSON.stringify(testRenderer.toJSON());
    expect(treeString).toContain('Delete transaction');
    expect(treeString).toContain('Dialog content');
    expect(treeString).toContain('取消');
    expect(treeString).toContain('确定');
  });
  it('renders custom title and action nodes', () => {
    const testRenderer = renderDialog({
      cancel: <RNText>Keep</RNText>,
      defaultOpen: true,
      ok: <RNText>Delete</RNText>,
      title: <RNText>Custom title</RNText>
    });
    const treeString = JSON.stringify(testRenderer.toJSON());
    expect(treeString).toContain('Custom title');
    expect(treeString).toContain('Keep');
    expect(treeString).toContain('Delete');
  });
  it('fires onCancel before onOpenChange when the cancel action is pressed', () => {
    const calls: string[] = [];
    const testRenderer = renderDialog({
      defaultOpen: true,
      onCancel: params => calls.push(`cancel:${params.reason}`),
      onOpenChange: (nextOpen, params) => calls.push(`open:${nextOpen}:${params.reason}`)
    });
    act(() => {
      testRenderer.root.findByProps({
        testID: 'dialog-cancel-button'
      }).props.onPress();
    });
    expect(calls).toEqual(['cancel:cancel', 'open:false:cancel']);
    expect(testRenderer.toJSON()).toBeNull();
  });
  it('fires onOk before closing when the ok action is pressed', () => {
    const calls: string[] = [];
    const testRenderer = renderDialog({
      defaultOpen: true,
      onOk: () => calls.push('ok'),
      onOpenChange: (nextOpen, params) => calls.push(`open:${nextOpen}:${params.reason}`)
    });
    act(() => {
      testRenderer.root.findByProps({
        testID: 'dialog-ok-button'
      }).props.onPress();
    });
    expect(calls).toEqual(['ok', 'open:false:ok']);
    expect(testRenderer.toJSON()).toBeNull();
  });
  it('does not close or call onOk when okDisabled is true', () => {
    const onOk = jest.fn();
    const testRenderer = renderDialog({
      defaultOpen: true,
      okDisabled: true,
      onOk
    });
    act(() => {
      testRenderer.root.findByProps({
        testID: 'dialog-ok-button'
      }).props.onPress();
    });
    expect(onOk).not.toHaveBeenCalled();
    expect(JSON.stringify(testRenderer.toJSON())).toContain('Dialog content');
  });
  it('uses Popup mask cancellation as dialog cancellation', () => {
    const calls: string[] = [];
    const testRenderer = renderDialog({
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
    expect(testRenderer.toJSON()).toBeNull();
  });
  it('does not emit onCancel when the parent closes a controlled dialog externally', () => {
    const onCancel = jest.fn();
    const onOpenChange = jest.fn();
    let testRenderer: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(<><Dialog open onCancel={onCancel} onOpenChange={onOpenChange}>
            <RNText>Dialog content</RNText>
          </Dialog></>);
    });
    act(() => {
      testRenderer!.update(<><Dialog open={false} onCancel={onCancel} onOpenChange={onOpenChange}>
            <RNText>Dialog content</RNText>
          </Dialog></>);
    });
    expect(onCancel).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });
  it('uses the same default popup layer as Popup', () => {
    const dialogRenderer = renderDialog({
      defaultOpen: true
    });
    const popupRenderer = renderPopup({
      defaultOpen: true
    });
    const dialogLayout = flattenStyle(dialogRenderer.root.findByProps({
      testID: 'popup-layout'
    }).props.style);
    const popupLayout = flattenStyle(popupRenderer.root.findByProps({
      testID: 'popup-layout'
    }).props.style);
    expect(dialogLayout.zIndex).toBe(popupLayout.zIndex);
  });
  it('renders arbitrary children as dialog body content', () => {
    const testRenderer = renderDialog({
      defaultOpen: true
    }, <View testID="custom-dialog-child">
        <RNText>Custom body</RNText>
      </View>);
    expect(testRenderer.root.findByProps({
      testID: 'custom-dialog-child'
    })).toBeTruthy();
  });
  it('keeps content local when mountPoint is local inside a PortalProvider', () => {
    let testRenderer: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(<><PortalProvider>
            <View testID="provider-host">
              <Dialog open mountPoint="local">
                <RNText>Dialog content</RNText>
              </Dialog>
            </View>
          </PortalProvider></>);
    });
    const providerHost = testRenderer!.root.findByProps({
      testID: 'provider-host'
    });
    const dialogPanel = testRenderer!.root.findByProps({
      testID: 'dialog-panel'
    });
    const ancestors: renderer.ReactTestInstance[] = [];
    let current = dialogPanel.parent;
    while (current) {
      ancestors.push(current);
      current = current.parent;
    }
    expect(ancestors).toContain(providerHost);
  });
  it('throws when mountPoint is portal without a PortalProvider', () => {
    expect(() => {
      act(() => {
        renderer.create(<><Dialog open mountPoint="portal">
              <RNText>Dialog content</RNText>
            </Dialog></>);
      });
    }).toThrow('PortalProvider');
  });
});
