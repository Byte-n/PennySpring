import React from 'react';
import { Pressable, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Tag } from '../src/Tag';
function renderTag(props: Partial<React.ComponentProps<typeof Tag>> = {}) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><Tag {...props} /></>);
  });
  return testRenderer!;
}
function getRoot(testRenderer: renderer.ReactTestRenderer) {
  const pressableRoot = testRenderer.root.findAll(node => {
    return typeof node.props.style === 'function';
  })[0];
  return pressableRoot ?? testRenderer.root.findAllByType(View)[0];
}
function getPressableRoot(testRenderer: renderer.ReactTestRenderer) {
  return testRenderer.root.find(node => {
    return typeof node.props.onPress === 'function' && typeof node.props.style === 'function';
  });
}
describe('Tag', () => {
  it('uses Pressable root and invokes onPress when enabled', () => {
    const onPress = jest.fn();
    const testRenderer = renderTag({
      onPress,
      children: 'Open'
    });
    const root = getPressableRoot(testRenderer);
    act(() => {
      root.props.onPress({} as never);
    });
    expect(onPress).toHaveBeenCalledTimes(1);
  });
  it('blocks disabled press from invoking onPress', () => {
    const onPress = jest.fn();
    const testRenderer = renderTag({
      disabled: true,
      onPress,
      children: 'Disabled'
    });
    const root = getPressableRoot(testRenderer);
    act(() => {
      root.props.onPress({} as never);
    });
    expect(onPress).not.toHaveBeenCalled();
  });
  it('uses View root when onPress is absent', () => {
    const testRenderer = renderTag({
      children: 'Static'
    });
    expect(testRenderer.root.findAllByType(Pressable)).toHaveLength(0);
    expect(testRenderer.root.findAllByType(View).length).toBeGreaterThan(0);
  });
  it('forwards root props to the View root when onPress is absent', () => {
    const testRenderer = renderTag({
      testID: 'static-tag',
      children: 'Static'
    });
    const root = getRoot(testRenderer);
    expect(root.props.testID).toBe('static-tag');
  });
});
