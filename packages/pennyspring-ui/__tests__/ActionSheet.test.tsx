import React from 'react';
import { Text as RNText } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ActionSheet } from '../src/ActionSheet';
function renderActionSheet(props: Partial<React.ComponentProps<typeof ActionSheet>> = {}) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><ActionSheet actions={[{
        text: 'Option 1'
      }, {
        text: 'Option 2'
      }, {
        text: 'Option 3'
      }]} {...props} /></>);
  });
  return testRenderer!;
}
describe('ActionSheet', () => {
  it('does not render anything when closed', () => {
    const testRenderer = renderActionSheet();
    expect(testRenderer.toJSON()).toBeNull();
  });
  it('renders actions when opened', () => {
    const testRenderer = renderActionSheet({
      defaultOpen: true
    });
    const treeString = JSON.stringify(testRenderer.toJSON());
    expect(treeString).toContain('Option 1');
    expect(treeString).toContain('Option 2');
    expect(treeString).toContain('Option 3');
  });
  it('renders title when provided', () => {
    const testRenderer = renderActionSheet({
      defaultOpen: true,
      titleText: 'Select an option'
    });
    const treeString = JSON.stringify(testRenderer.toJSON());
    expect(treeString).toContain('Select an option');
  });
  it('renders a single title container when titleText is provided', () => {
    const testRenderer = renderActionSheet({
      defaultOpen: true,
      titleText: 'Select an option'
    });
    const titleContainers = testRenderer.root.findAllByProps({
      testID: 'action-sheet-title-container'
    });
    expect(titleContainers).toHaveLength(1);
  });
  it('renders cancel button when cancelText is provided', () => {
    const testRenderer = renderActionSheet({
      cancelText: 'Cancel',
      defaultOpen: true
    });
    const treeString = JSON.stringify(testRenderer.toJSON());
    expect(treeString).toContain('Cancel');
  });
  it('fires onAction when an action is pressed', () => {
    const onAction = jest.fn();
    const testRenderer = renderActionSheet({
      defaultOpen: true,
      onAction
    });
    act(() => {
      testRenderer.root.findByProps({
        testID: 'action-sheet-action-0'
      }).props.onPress();
    });
    expect(onAction).toHaveBeenCalledWith({
      text: 'Option 1'
    }, 0);
  });
  it('fires onCancel before onOpenChange when cancel is pressed', () => {
    const calls: string[] = [];
    const testRenderer = renderActionSheet({
      cancelText: 'Cancel',
      defaultOpen: true,
      onCancel: () => calls.push('cancel'),
      onOpenChange: nextOpen => calls.push(`open:${nextOpen}`)
    });
    act(() => {
      testRenderer.root.findByProps({
        testID: 'action-sheet-cancel-button'
      }).props.onPress();
    });
    expect(calls).toEqual(['cancel', 'open:false']);
  });
  it('fires onCancel before onOpenChange when mask is pressed', () => {
    const calls: string[] = [];
    const testRenderer = renderActionSheet({
      defaultOpen: true,
      onCancel: () => calls.push('cancel'),
      onOpenChange: nextOpen => calls.push(`open:${nextOpen}`)
    });
    act(() => {
      testRenderer.root.findByProps({
        testID: 'popup-mask'
      }).props.onPress();
    });
    expect(calls).toEqual(['cancel', 'open:false']);
  });
  it('does not emit onCancel when the parent closes a controlled action sheet externally', () => {
    const onCancel = jest.fn();
    const onOpenChange = jest.fn();
    let testRenderer: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(<><ActionSheet actions={[{
          text: 'Option 1'
        }]} open onCancel={onCancel} onOpenChange={onOpenChange} /></>);
    });
    act(() => {
      testRenderer!.update(<><ActionSheet actions={[{
          text: 'Option 1'
        }]} open={false} onCancel={onCancel} onOpenChange={onOpenChange} /></>);
    });
    expect(onCancel).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });
  it('renders custom title node', () => {
    const testRenderer = renderActionSheet({
      defaultOpen: true,
      title: <RNText>Custom title</RNText>
    });
    const treeString = JSON.stringify(testRenderer.toJSON());
    expect(treeString).toContain('Custom title');
  });
  it('renders custom cancel node', () => {
    const testRenderer = renderActionSheet({
      cancel: <RNText>Custom cancel</RNText>,
      defaultOpen: true
    });
    const treeString = JSON.stringify(testRenderer.toJSON());
    expect(treeString).toContain('Custom cancel');
  });
  it('does not render title when title is explicitly null', () => {
    const testRenderer = renderActionSheet({
      defaultOpen: true,
      title: null,
      titleText: 'Select an option'
    });
    expect(() => testRenderer.root.findByProps({
      testID: 'action-sheet-title-container'
    })).toThrow();
    expect(() => testRenderer.root.findByProps({
      testID: 'action-sheet-title-text'
    })).toThrow();
  });
  it('does not render cancel area when cancel is explicitly null', () => {
    const testRenderer = renderActionSheet({
      cancel: null,
      cancelText: 'Cancel',
      defaultOpen: true
    });
    expect(() => testRenderer.root.findByProps({
      testID: 'action-sheet-cancel-container'
    })).toThrow();
    expect(() => testRenderer.root.findByProps({
      testID: 'action-sheet-cancel-text'
    })).toThrow();
  });
  it('supports actions with description', () => {
    const testRenderer = renderActionSheet({
      actions: [{
        text: 'Option 1',
        description: 'Description 1'
      }, {
        text: 'Option 2',
        description: 'Description 2'
      }],
      defaultOpen: true
    });
    const treeString = JSON.stringify(testRenderer.toJSON());
    expect(treeString).toContain('Option 1');
    expect(treeString).toContain('Description 1');
    expect(treeString).toContain('Option 2');
    expect(treeString).toContain('Description 2');
  });
  it('supports actions with danger style', () => {
    const testRenderer = renderActionSheet({
      actions: [{
        text: 'Delete',
        danger: true
      }, {
        text: 'Cancel'
      }],
      defaultOpen: true
    });
    const dangerAction = testRenderer.root.findByProps({
      testID: 'action-sheet-action-0'
    });
    expect(dangerAction).toBeTruthy();
  });
  it('supports actions with disabled state', () => {
    const onAction = jest.fn();
    const testRenderer = renderActionSheet({
      actions: [{
        text: 'Option 1',
        disabled: true
      }, {
        text: 'Option 2'
      }],
      defaultOpen: true,
      onAction
    });
    act(() => {
      testRenderer.root.findByProps({
        testID: 'action-sheet-action-0'
      }).props.onPress();
    });
    expect(onAction).not.toHaveBeenCalled();
  });
  it('uses Popup position bottom', () => {
    const testRenderer = renderActionSheet({
      defaultOpen: true
    });
    const layout = testRenderer.root.findByProps({
      testID: 'popup-layout'
    });
    expect(layout).toBeTruthy();
  });
});
