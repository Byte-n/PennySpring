import React from 'react';
import { ActivityIndicator, Text as RNText, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Button } from '../src/Button';
function renderButton(props: Partial<React.ComponentProps<typeof Button>> = {}) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><Button {...props} /></>);
  });
  return testRenderer!;
}
function flattenStyle(style: unknown) {
  const styles = Array.isArray(style) ? style : [style];
  return Object.assign({}, ...styles);
}
function getPressableRoot(testRenderer: renderer.ReactTestRenderer) {
  return testRenderer.root.find(node => {
    return node.props.accessibilityRole === 'button';
  });
}
function getRootStyle(testRenderer: renderer.ReactTestRenderer, pressed = false) {
  const root = getPressableRoot(testRenderer);
  const style = typeof root.props.style === 'function' ? root.props.style({
    pressed
  }) : root.props.style;
  return flattenStyle(style);
}
function findNodesWithStyle(testRenderer: renderer.ReactTestRenderer, markerStyle: Record<string, unknown>) {
  return testRenderer.root.findAll(node => {
    const style = node.props.style;
    return style === markerStyle || Array.isArray(style) && style.includes(markerStyle);
  });
}
describe('Button', () => {
  it('renders text content with a button role', () => {
    const testRenderer = renderButton({
      children: 'Save'
    });
    const root = getPressableRoot(testRenderer);
    expect(root.props.accessibilityRole).toBe('button');
    expect(JSON.stringify(testRenderer.toJSON())).toContain('Save');
  });
  it('orders icon and content by icon placement', () => {
    const startIcon = renderButton({
      icon: <RNText>Icon</RNText>,
      children: 'Label'
    });
    const endIcon = renderButton({
      icon: <RNText>Icon</RNText>,
      iconPlacement: 'end',
      children: 'Label'
    });
    const startTree = JSON.stringify(startIcon.toJSON());
    const endTree = JSON.stringify(endIcon.toJSON());
    expect(startTree.indexOf('Icon')).toBeLessThan(startTree.indexOf('Label'));
    expect(endTree.indexOf('Label')).toBeLessThan(endTree.indexOf('Icon'));
  });
  it('blocks presses while loading and exposes busy state', () => {
    const onPress = jest.fn();
    const testRenderer = renderButton({
      loading: true,
      onPress,
      children: 'Save'
    });
    const root = getPressableRoot(testRenderer);
    act(() => {
      root.props.onPress({} as never);
    });
    expect(onPress).not.toHaveBeenCalled();
    expect(root.props.accessibilityState.busy).toBe(true);
    expect(testRenderer.root.findAllByType(ActivityIndicator)).toHaveLength(1);
  });
  it('blocks disabled presses and exposes disabled accessibility state', () => {
    const onPress = jest.fn();
    const testRenderer = renderButton({
      disabled: true,
      onPress,
      children: 'Disabled'
    });
    const root = getPressableRoot(testRenderer);
    act(() => {
      root.props.onPress({} as never);
    });
    expect(onPress).not.toHaveBeenCalled();
    expect(root.props.accessibilityState.disabled).toBe(true);
  });
  it('supports block layout', () => {
    const testRenderer = renderButton({
      block: true,
      children: 'Submit'
    });
    expect(getRootStyle(testRenderer).width).toBe('100%');
  });
  it('uses loading delay before entering busy state', () => {
    jest.useFakeTimers();
    const testRenderer = renderButton({
      loading: {
        delay: 100
      },
      children: 'Save'
    });
    expect(testRenderer.root.findAllByType(ActivityIndicator)).toHaveLength(0);
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(testRenderer.root.findAllByType(ActivityIndicator)).toHaveLength(1);
    jest.useRealTimers();
  });
  it('renders custom loading icon instead of the default indicator', () => {
    const loadingIconStyle = {
      opacity: 0.64
    };
    const testRenderer = renderButton({
      loading: {
        icon: <View style={loadingIconStyle} />
      },
      children: 'Save'
    });
    expect(testRenderer.root.findAllByType(ActivityIndicator)).toHaveLength(0);
    expect(findNodesWithStyle(testRenderer, loadingIconStyle).length).toBeGreaterThan(0);
  });
});
