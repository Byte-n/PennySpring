import React from 'react';
import { ActivityIndicator, Text as RNText, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { defaultSeedToken } from '@pennyspring/theme';
import { derivative } from '@pennyspring/theme/src/algorithms/derivative';
import { formatToken } from '@pennyspring/theme/src/algorithms/formatToken';
import { Button } from '../src/Button';

const token = formatToken(derivative(defaultSeedToken, false));

function renderButton(props: Partial<React.ComponentProps<typeof Button>> = {}) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <ThemeProvider>
        <Button {...props} />
      </ThemeProvider>,
    );
  });

  return testRenderer!;
}

function flattenStyle(style: unknown) {
  const styles = Array.isArray(style) ? style : [style];

  return Object.assign({}, ...styles);
}

function getPressableRoot(testRenderer: renderer.ReactTestRenderer) {
  return testRenderer.root.find((node) => {
    return node.props.accessibilityRole === 'button';
  });
}

function getRootStyle(
  testRenderer: renderer.ReactTestRenderer,
  pressed = false,
) {
  const root = getPressableRoot(testRenderer);
  const style = typeof root.props.style === 'function'
    ? root.props.style({ pressed })
    : root.props.style;

  return flattenStyle(style);
}

function findNodesWithStyle(
  testRenderer: renderer.ReactTestRenderer,
  markerStyle: Record<string, unknown>,
) {
  return testRenderer.root.findAll((node) => {
    const style = node.props.style;

    return style === markerStyle || (Array.isArray(style) && style.includes(markerStyle));
  });
}

describe('Button', () => {
  it('renders text content with a button role', () => {
    const testRenderer = renderButton({
      children: 'Save',
    });
    const root = getPressableRoot(testRenderer);

    expect(root.props.accessibilityRole).toBe('button');
    expect(JSON.stringify(testRenderer.toJSON())).toContain('Save');
  });

  it('maps primary type to a solid primary button', () => {
    const testRenderer = renderButton({
      type: 'primary',
      children: 'Save',
    });
    const rootStyle = getRootStyle(testRenderer);

    expect(rootStyle.backgroundColor).toBe(token.colorPrimary);
    expect(rootStyle.borderColor).toBe(token.colorPrimary);
  });

  it('lets explicit color and variant override type', () => {
    const testRenderer = renderButton({
      type: 'primary',
      color: 'danger',
      variant: 'outlined',
      children: 'Delete',
    });
    const rootStyle = getRootStyle(testRenderer);

    expect(rootStyle.backgroundColor).toBe(token.colorBgContainer);
    expect(rootStyle.borderColor).toBe(token.colorErrorBorder);
  });

  it('maps danger to the error color family', () => {
    const testRenderer = renderButton({
      danger: true,
      children: 'Delete',
    });
    const rootStyle = getRootStyle(testRenderer);

    expect(rootStyle.borderColor).toBe(token.colorErrorBorder);
  });

  it('applies size and shape styles without external layout work', () => {
    const largeRound = renderButton({
      size: 'large',
      shape: 'round',
      children: 'Continue',
    });
    const circle = renderButton({
      shape: 'circle',
      icon: <RNText>+</RNText>,
      accessibilityLabel: 'Add',
    });

    expect(getRootStyle(largeRound).minHeight).toBe(token.controlHeightLG);
    expect(getRootStyle(largeRound).borderRadius).toBe(token.controlHeightLG / 2);
    expect(getRootStyle(circle).width).toBe(token.controlHeight);
    expect(getRootStyle(circle).borderRadius).toBe(token.controlHeight / 2);
  });

  it('orders icon and content by icon placement', () => {
    const startIcon = renderButton({
      icon: <RNText>Icon</RNText>,
      children: 'Label',
    });
    const endIcon = renderButton({
      icon: <RNText>Icon</RNText>,
      iconPlacement: 'end',
      children: 'Label',
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
      children: 'Save',
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
      children: 'Disabled',
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
      children: 'Submit',
    });

    expect(getRootStyle(testRenderer).width).toBe('100%');
  });

  it('uses loading delay before entering busy state', () => {
    jest.useFakeTimers();
    const testRenderer = renderButton({
      loading: {
        delay: 100,
      },
      children: 'Save',
    });

    expect(testRenderer.root.findAllByType(ActivityIndicator)).toHaveLength(0);

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(testRenderer.root.findAllByType(ActivityIndicator)).toHaveLength(1);
    jest.useRealTimers();
  });

    it('renders custom loading icon instead of the default indicator', () => {
    const loadingIconStyle = { opacity: 0.64 };
    const testRenderer = renderButton({
      loading: {
        icon: <View style={loadingIconStyle} />,
      },
      children: 'Save',
    });

    expect(testRenderer.root.findAllByType(ActivityIndicator)).toHaveLength(0);
    expect(findNodesWithStyle(testRenderer, loadingIconStyle).length).toBeGreaterThan(0);
  });
});
