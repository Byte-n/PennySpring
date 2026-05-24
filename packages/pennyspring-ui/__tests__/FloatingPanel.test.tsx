import React from 'react';
import { Text as RNText } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Popup } from '../src/Popup';

describe('Popup.FloatingPanel', () => {

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
});
