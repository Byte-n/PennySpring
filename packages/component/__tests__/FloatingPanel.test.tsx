import React from 'react';
import { Text as RNText } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Popup } from '../src/Popup';

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

describe('Popup.FloatingPanel', () => {
  it('clamps default value within min and max bounds', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <Popup.FloatingPanel
          defaultOpen
          defaultValue={500}
          maxHeight={320}
          minHeight={180}
        >
          <RNText>content</RNText>
        </Popup.FloatingPanel>,
      );
    });

    const bodyStyle = flattenStyle(
      testRenderer!.root.findByProps({ testID: 'popup-body' }).props.style,
    );

    expect(bodyStyle.height).toBe(320);
  });

  it('places the drag handle at top for bottom position', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <Popup.FloatingPanel defaultOpen position="bottom">
          <RNText>content</RNText>
        </Popup.FloatingPanel>,
      );
    });

    const tree = JSON.stringify(testRenderer!.toJSON());
    expect(tree.indexOf('floating-panel-handle')).toBeGreaterThan(-1);
    expect(tree.indexOf('floating-panel-handle')).toBeLessThan(
      tree.indexOf('content'),
    );
  });

  it('places the drag handle at bottom for top position', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <Popup.FloatingPanel defaultOpen position="top">
          <RNText>content</RNText>
        </Popup.FloatingPanel>,
      );
    });

    const tree = JSON.stringify(testRenderer!.toJSON());
    expect(tree.indexOf('floating-panel-handle')).toBeGreaterThan(
      tree.indexOf('content'),
    );
  });

  it('updates height when dragging from bottom and clamps to max', () => {
    const onChange = jest.fn();
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <Popup.FloatingPanel
          defaultOpen
          defaultValue={260}
          maxHeight={400}
          minHeight={200}
          onChange={onChange}
          position="bottom"
        >
          <RNText>content</RNText>
        </Popup.FloatingPanel>,
      );
    });

    const handle = testRenderer!.root.findByProps({
      testID: 'floating-panel-handle',
    });

    act(() => {
      handle.props.onResponderGrant({}, { dy: 0 });
      handle.props.onResponderMove({}, { dy: -300 });
      handle.props.onResponderRelease({}, { dy: -300 });
    });

    expect(onChange).toHaveBeenLastCalledWith(400);

    const bodyStyle = flattenStyle(
      testRenderer!.root.findByProps({ testID: 'popup-body' }).props.style,
    );

    expect(bodyStyle.height).toBe(400);
  });

  it('updates height when dragging from top and clamps to min', () => {
    const onChange = jest.fn();
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <Popup.FloatingPanel
          defaultOpen
          defaultValue={260}
          maxHeight={400}
          minHeight={200}
          onChange={onChange}
          position="top"
        >
          <RNText>content</RNText>
        </Popup.FloatingPanel>,
      );
    });

    const handle = testRenderer!.root.findByProps({
      testID: 'floating-panel-handle',
    });

    act(() => {
      handle.props.onResponderGrant({}, { dy: 0 });
      handle.props.onResponderMove({}, { dy: -300 });
      handle.props.onResponderRelease({}, { dy: -300 });
    });

    expect(onChange).toHaveBeenLastCalledWith(200);

    const bodyStyle = flattenStyle(
      testRenderer!.root.findByProps({ testID: 'popup-body' }).props.style,
    );

    expect(bodyStyle.height).toBe(200);
  });
});
