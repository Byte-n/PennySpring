import React from 'react';
import { StyleSheet, Text as RNText } from 'react-native';
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

  it('uses the height prop as the panel height', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <Popup.FloatingPanel defaultOpen height={320}>
          <RNText>content</RNText>
        </Popup.FloatingPanel>,
      );
    });

    const popupBody = testRenderer!.root.findByProps({
      testID: 'popup-body',
    });
    const flattenedStyle = StyleSheet.flatten(popupBody.props.style);

    expect(flattenedStyle.height).toBe(320);
  });

  it('uses the height prop as a resizable initial height', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <Popup.FloatingPanel defaultOpen height={320}>
          <RNText>content</RNText>
        </Popup.FloatingPanel>,
      );
    });

    const handle = testRenderer!.root.findByProps({
      testID: 'floating-panel-handle',
    });

    act(() => {
      handle.props.onResponderGrant();
      handle.props.onResponderMove(undefined, { dy: -100 });
    });

    const popupBody = testRenderer!.root.findByProps({
      testID: 'popup-body',
    });
    const flattenedStyle = StyleSheet.flatten(popupBody.props.style);

    expect(flattenedStyle.height).toBe(420);
  });

  it('resolves percentage height against the viewport height', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <Popup.FloatingPanel defaultOpen height="50%">
          <RNText>content</RNText>
        </Popup.FloatingPanel>,
      );
    });

    const popupBody = testRenderer!.root.findByProps({
      testID: 'popup-body',
    });
    const flattenedStyle = StyleSheet.flatten(popupBody.props.style);

    expect(flattenedStyle.height).toBe(667);
  });

  it('resolves percentage minHeight and maxHeight before clamping value', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <Popup.FloatingPanel
          defaultOpen
          maxHeight="50%"
          minHeight="25%"
          value={800}
        >
          <RNText>content</RNText>
        </Popup.FloatingPanel>,
      );
    });

    const popupBody = testRenderer!.root.findByProps({
      testID: 'popup-body',
    });
    const flattenedStyle = StyleSheet.flatten(popupBody.props.style);

    expect(flattenedStyle.height).toBe(667);
  });
});
