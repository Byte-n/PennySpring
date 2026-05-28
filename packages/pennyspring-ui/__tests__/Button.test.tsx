import React from 'react';
import { ActivityIndicator } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Button } from '../src/Button';
import { Icon } from '../src/Icon';
import { Row } from '../src/Row';
import { Text } from '../src/Text';
function renderButton(props: Partial<React.ComponentProps<typeof Button>> = {}) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><Button {...props} /></>);
  });
  return testRenderer!;
}
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
function getPressableRoot(testRenderer: renderer.ReactTestRenderer) {
  // The Button renders a single Pressable as its root element
  return testRenderer.root.children[0] as renderer.ReactTestInstance;
}

function getRootStyle(testRenderer: renderer.ReactTestRenderer) {
  const root = getPressableRoot(testRenderer);
  const style = root.props.style({ pressed: false });
  return flattenStyle(style) as Record<string, unknown>;
}
function getContentTextStyle(testRenderer: renderer.ReactTestRenderer) {
  const textNode = testRenderer.root.findByType(Text);
  return flattenStyle(textNode.props.style) as Record<string, unknown>;
}
describe('Button', () => {
  it('renders text content', () => {
    const testRenderer = renderButton({
      children: 'Save'
    });
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
    const smallText = smallRenderer.root.findByType(Text);
    const normalText = normalRenderer.root.findByType(Text);
    const largeText = largeRenderer.root.findByType(Text);
    expect(smallIcon.props.size).toBe('small');
    expect(normalIcon.props.size).toBe('normal');
    expect(largeIcon.props.size).toBe('large');
    expect(smallText.props.size).toBe('sm');
    expect(normalText.props.size).toBe('md');
    expect(largeText.props.size).toBe('lg');
  });
  it('blocks presses while loading', () => {
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
    expect(testRenderer.root.findAllByType(ActivityIndicator)).toHaveLength(1);
  });
  it('blocks disabled presses', () => {
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
    expect(root.props.disabled).toBe(true);
  });
  it('overrides custom text color with disabled text color for text button', () => {
    const enabledRenderer = renderButton({
      type: 'text',
      disabled: false,
      children: <Text style={{ color: 'red' }}>Enabled text</Text>,
    });
    const disabledRenderer = renderButton({
      type: 'text',
      disabled: true,
      children: <Text style={{ color: 'red' }}>Disabled text</Text>,
    });

    expect(getContentTextStyle(enabledRenderer).color).toBe('red');
    expect(getContentTextStyle(disabledRenderer).color).not.toBe('red');
  });
  it('uses vertical padding instead of min height constraints', () => {
    const testRenderer = renderButton({
      size: 'normal',
      children: 'Save',
    });
    const rootStyle = getRootStyle(testRenderer);

    expect(rootStyle.paddingVertical).toBeDefined();
    expect(rootStyle.minHeight).toBeUndefined();
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
  it('uses token-driven color and size for default loading indicator', () => {
    const baselineRenderer = renderButton({
      icon: 'check',
      size: 'large',
      children: 'Save',
    });
    const enabledRenderer = renderButton({
      loading: true,
      icon: 'check',
      size: 'large',
      children: 'Save',
    });
    const disabledRenderer = renderButton({
      loading: true,
      icon: 'check',
      size: 'large',
      disabled: true,
      children: 'Save',
    });

    const enabledIndicator = enabledRenderer.root.findByType(ActivityIndicator);
    const disabledIndicator = disabledRenderer.root.findByType(ActivityIndicator);
    const baselineIcon = baselineRenderer.root.findByType(Icon);

    expect(enabledIndicator.props.color).toBe(baselineIcon.props.color);
    expect(baselineIcon.props.size).toBe('large');
    expect(disabledIndicator.props.color).not.toBe(enabledIndicator.props.color);
    expect(typeof enabledIndicator.props.size).toBe('number');
  });
  it('maps button text semantics to Text props before style overrides', () => {
    // Arrange
    const testRenderer = renderButton({
      type: 'primary',
      size: 'small',
      children: 'Save',
    });

    // Act
    const textNode = testRenderer.root.findByType(Text);
    const textStyle = getContentTextStyle(testRenderer);

    // Assert
    expect(textNode.props.size).toBe('sm');
    expect(textNode.props.weight).toBe('medium');
    expect(textNode.props.color).toBe('lightSolid');
    expect(textStyle.color).toBeUndefined();
    expect(textStyle.fontSize).toBeUndefined();
    expect(textStyle.fontWeight).toBeUndefined();
  });
  it('renders icon container with Row layout primitive', () => {
    // Arrange
    const testRenderer = renderButton({
      icon: 'check',
      children: 'Save',
    });

    // Act
    const rowNodes = testRenderer.root.findAllByType(Row);

    // Assert
    expect(rowNodes).toHaveLength(1);
  });
});
