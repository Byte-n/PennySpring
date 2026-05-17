import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Button } from '../src/Button';
import { Icon } from '../src/Icon';
import { Text } from '../src/Text';
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
function getContentTextStyle(testRenderer: renderer.ReactTestRenderer) {
  const textNode = testRenderer.root.findByType(Text);
  return flattenStyle(textNode.props.style) as Record<string, unknown>;
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
      icon: 'check',
      children: 'Label'
    });
    const endIcon = renderButton({
      icon: 'check',
      iconPlacement: 'end',
      children: 'Label'
    });
    const startChildren = (startIcon.toJSON() as renderer.ReactTestRendererJSON).children ?? [];
    const endChildren = (endIcon.toJSON() as renderer.ReactTestRendererJSON).children ?? [];
    expect((startChildren[0] as renderer.ReactTestRendererJSON).type).toBe('View');
    expect((endChildren[0] as renderer.ReactTestRendererJSON).type).toBe('Text');
  });
  it('passes iconProps to internal icon renderer', () => {
    const testRenderer = renderButton({
      icon: 'check',
      iconProps: { weight: 'fill' },
      children: 'Save'
    });
    const iconNode = testRenderer.root.findByType(Icon);
    expect(iconNode.props.weight).toBe('fill');
  });
  it('scales icon size with button size', () => {
    const smallRenderer = renderButton({
      icon: 'check',
      size: 'small',
      children: 'Save'
    });
    const normalRenderer = renderButton({
      icon: 'check',
      size: 'normal',
      children: 'Save'
    });
    const largeRenderer = renderButton({
      icon: 'check',
      size: 'large',
      children: 'Save'
    });
    const smallIcon = smallRenderer.root.findByType(Icon);
    const normalIcon = normalRenderer.root.findByType(Icon);
    const largeIcon = largeRenderer.root.findByType(Icon);
    const smallTextStyle = getContentTextStyle(smallRenderer);
    const normalTextStyle = getContentTextStyle(normalRenderer);
    const largeTextStyle = getContentTextStyle(largeRenderer);
    expect(typeof smallIcon.props.size).toBe('number');
    expect(typeof normalIcon.props.size).toBe('number');
    expect(typeof largeIcon.props.size).toBe('number');
    expect(normalIcon.props.size).toBeGreaterThan(smallIcon.props.size);
    expect(largeIcon.props.size).toBeGreaterThan(normalIcon.props.size);
    expect(smallIcon.props.size).toBeGreaterThan(smallTextStyle.fontSize as number);
    expect(normalIcon.props.size).toBeGreaterThan(normalTextStyle.fontSize as number);
    expect(largeIcon.props.size).toBeGreaterThan(largeTextStyle.fontSize as number);
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
