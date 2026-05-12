import React from 'react';
import { Pressable, Text as RNText, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { defaultSeedToken } from '@pennyspring/theme';
import { derivative } from '@pennyspring/theme/src/algorithms/derivative';
import { formatToken } from '@pennyspring/theme/src/algorithms/formatToken';
import { Tag } from '../src/Tag';

const token = formatToken(derivative(defaultSeedToken, false));

function renderTag(props: Partial<React.ComponentProps<typeof Tag>> = {}) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <ThemeProvider>
        <Tag {...props} />
      </ThemeProvider>,
    );
  });

  return testRenderer!;
}

function flattenStyle(style: unknown) {
  const styles = Array.isArray(style) ? style : [style];

  return Object.assign({}, ...styles);
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

function getRoot(testRenderer: renderer.ReactTestRenderer) {
  const pressableRoot = testRenderer.root.findAll((node) => {
    return typeof node.props.style === 'function';
  })[0];

  return pressableRoot ?? testRenderer.root.findAllByType(View)[0];
}

function getPressableRoot(testRenderer: renderer.ReactTestRenderer) {
  return testRenderer.root.find((node) => {
    return typeof node.props.onPress === 'function'
      && typeof node.props.style === 'function';
  });
}

function getRootStyle(
  testRenderer: renderer.ReactTestRenderer,
  pressed = false,
) {
  const root = getRoot(testRenderer);
  const style = typeof root.props.style === 'function'
    ? root.props.style({ pressed })
    : root.props.style;

  return flattenStyle(style);
}

describe('Tag', () => {
  it('renders primitive content through internal Text with content slot style', () => {
    const contentStyle = { opacity: 0.91 };
    const testRenderer = renderTag({
      styles: {
        content: contentStyle,
      },
      children: 'Paid',
    });
    const contentNodes = findNodesWithStyle(testRenderer, contentStyle);

    expect(contentNodes).toHaveLength(1);
    expect(contentNodes[0].props.children).toBe('Paid');
  });

  it('renders custom node content without applying content slot style to it', () => {
    const contentStyle = { opacity: 0.81 };
    const customStyle = { opacity: 0.82 };
    const testRenderer = renderTag({
      styles: {
        content: contentStyle,
      },
      children: <RNText style={customStyle}>Custom</RNText>,
    });

    expect(findNodesWithStyle(testRenderer, contentStyle)).toHaveLength(0);
    expect(findNodesWithStyle(testRenderer, customStyle).length).toBeGreaterThan(0);
  });

  it('maps size to token-driven root and content density', () => {
    const smallTag = renderTag({ size: 'small', children: 'Small' });
    const normalTag = renderTag({ children: 'Normal' });
    const largeTag = renderTag({ size: 'large', children: 'Large' });

    expect(getRootStyle(smallTag).minHeight).toBe(token.controlHeightXS);
    expect(getRootStyle(normalTag).minHeight).toBe(token.controlHeightSM);
    expect(getRootStyle(largeTag).minHeight).toBe(token.controlHeight);
    expect(getRootStyle(smallTag).paddingHorizontal).toBe(token.paddingXS);
    expect(getRootStyle(normalTag).paddingHorizontal).toBe(token.paddingSM);
    expect(getRootStyle(largeTag).paddingHorizontal).toBe(token.padding);
  });

  it('maps variant to token-driven root visual styles', () => {
    const filledTag = renderTag({ variant: 'filled', children: 'Default' });
    const outlinedTag = renderTag({ variant: 'outlined', children: 'Default' });
    const solidTag = renderTag({ variant: 'solid', color: 'primary', children: 'Primary' });

    expect(getRootStyle(filledTag).backgroundColor).toBe(token.colorFillQuaternary);
    expect(getRootStyle(outlinedTag).backgroundColor).toBe('transparent');
    expect(getRootStyle(outlinedTag).borderColor).toBe(token.colorBorder);
    expect(getRootStyle(solidTag).backgroundColor).toBe(token.colorPrimary);
    expect(getRootStyle(solidTag).borderColor).toBe(token.colorPrimary);
  });

  it('maps semantic and preset colors to token families', () => {
    const successTag = renderTag({
      color: 'success',
      variant: 'outlined',
      children: 'Success',
    });
    const goldTag = renderTag({
      color: 'gold',
      variant: 'filled',
      children: 'Gold',
    });

    expect(getRootStyle(successTag).borderColor).toBe(token.colorSuccessBorder);
    expect(getRootStyle(goldTag).backgroundColor).toBe(token.gold1);
  });

  it('uses Pressable root and invokes onPress when enabled', () => {
    const onPress = jest.fn();
    const testRenderer = renderTag({
      onPress,
      children: 'Open',
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
      children: 'Disabled',
    });
    const root = getPressableRoot(testRenderer);

    act(() => {
      root.props.onPress({} as never);
    });

    expect(onPress).not.toHaveBeenCalled();
  });

  it('uses View root when onPress is absent', () => {
    const testRenderer = renderTag({
      children: 'Static',
    });

    expect(testRenderer.root.findAllByType(Pressable)).toHaveLength(0);
    expect(testRenderer.root.findAllByType(View).length).toBeGreaterThan(0);
  });

  it('forwards root props to the View root when onPress is absent', () => {
    const testRenderer = renderTag({
      testID: 'static-tag',
      children: 'Static',
    });
    const root = getRoot(testRenderer);

    expect(root.props.testID).toBe('static-tag');
  });

  it('applies root style after token styles', () => {
    const rootStyle = { flex: 1 };
    const testRenderer = renderTag({
      onPress: jest.fn(),
      style: rootStyle,
      children: 'Pressable',
    });
    const root = getPressableRoot(testRenderer);

    expect(root.props.style({ pressed: false })).toContain(rootStyle);
  });

  it('exports Tag from the package entry', () => {
    jest.isolateModules(() => {
      jest.doMock('@react-navigation/material-top-tabs', () => ({
        createMaterialTopTabNavigator: () => ({
          Navigator: 'Navigator',
          Screen: 'Screen',
        }),
      }));
      jest.doMock('react-native-gesture-handler', () => {
        const ReactNative = require('react-native');

        return {
          GestureHandlerRootView: ReactNative.View,
        };
      });
      jest.doMock('react-native-reanimated', () => {
        const React = require('react');
        const ReactNative = require('react-native');

        return {
          __esModule: true,
          default: {
            View: ReactNative.View,
          },
          createAnimatedComponent: (Component: React.ComponentType<unknown>) => {
            return React.forwardRef((props: unknown, ref: unknown) => {
              return <Component {...(props as object)} ref={ref as never} />;
            });
          },
          interpolate: (value: number) => value,
          useAnimatedStyle: (updater: () => Record<string, unknown>) => updater(),
          useSharedValue: (value: number) => ({ value }),
          withTiming: (value: number) => value,
        };
      });

      const packageExports = require('../src');

      expect(typeof packageExports.Tag).toBe('function');
    });
  });
});
