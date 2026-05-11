import React from 'react';
import { Text as RNText, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { defaultSeedToken } from '@pennyspring/theme';
import { derivative } from '@pennyspring/theme/src/algorithms/derivative';
import { formatToken } from '@pennyspring/theme/src/algorithms/formatToken';
import { Result } from '../src/Result';

const token = formatToken(derivative(defaultSeedToken, false));

function renderResult(props: Partial<React.ComponentProps<typeof Result>> = {}) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <ThemeProvider>
        <Result {...props} />
      </ThemeProvider>,
    );
  });

  return testRenderer!;
}

function flattenStyle(style: unknown) {
  const styles = Array.isArray(style) ? style : [style];

  return Object.assign({}, ...styles);
}

function getRootStyle(testRenderer: renderer.ReactTestRenderer) {
  const root = testRenderer.root.findAllByType(View)[0];

  return flattenStyle(root.props.style);
}

describe('Result', () => {
  it('renders default info status with icon and title', () => {
    const testRenderer = renderResult({ titleText: 'Operation Info' });
    const tree = JSON.stringify(testRenderer.toJSON());

    expect(tree).toContain('Operation Info');
  });

  it('maps status to the correct icon color token', () => {
    const successResult = renderResult({
      status: 'success',
      titleText: 'Done',
    });
    const warningResult = renderResult({
      status: 'warning',
      titleText: 'Caution',
    });
    const errorResult = renderResult({
      status: 'error',
      titleText: 'Failed',
    });
    const infoResult = renderResult({
      status: 'info',
      titleText: 'Info',
    });

    const findIconContainer = (tr: renderer.ReactTestRenderer) => {
      const views = tr.root.findAllByType(View);
      return views[1];
    };

    expect(
      flattenStyle(findIconContainer(successResult).props.style).backgroundColor,
    ).toBe(token.colorSuccessBg);
    expect(
      flattenStyle(findIconContainer(warningResult).props.style).backgroundColor,
    ).toBe(token.colorWarningBg);
    expect(
      flattenStyle(findIconContainer(errorResult).props.style).backgroundColor,
    ).toBe(token.colorErrorBg);
    expect(
      flattenStyle(findIconContainer(infoResult).props.style).backgroundColor,
    ).toBe(token.colorInfoBg);
  });

  it('maps size to token-driven spacing and font sizes', () => {
    const smallResult = renderResult({ size: 'small', titleText: 'S' });
    const normalResult = renderResult({ titleText: 'N' });
    const largeResult = renderResult({ size: 'large', titleText: 'L' });

    expect(getRootStyle(smallResult).gap).toBe(token.marginXS);
    expect(getRootStyle(normalResult).gap).toBe(token.marginSM);
    expect(getRootStyle(largeResult).gap).toBe(token.marginMD);

    expect(getRootStyle(smallResult).paddingVertical).toBe(token.paddingSM);
    expect(getRootStyle(normalResult).paddingVertical).toBe(token.paddingMD);
    expect(getRootStyle(largeResult).paddingVertical).toBe(token.paddingLG);
  });

  it('renders subtitleText below the title', () => {
    const testRenderer = renderResult({
      titleText: 'Success',
      subtitleText: 'Your changes have been saved.',
    });
    const tree = JSON.stringify(testRenderer.toJSON());

    expect(tree).toContain('Success');
    expect(tree).toContain('Your changes have been saved.');
  });

  it('supports custom icon, title, subtitle, and extra nodes', () => {
    const customIcon = <RNText testID="custom-icon">★</RNText>;
    const customTitle = <RNText testID="custom-title">Custom Title</RNText>;
    const customSubtitle = (
      <RNText testID="custom-subtitle">Custom Sub</RNText>
    );
    const customExtra = <RNText testID="custom-extra">Action</RNText>;

    const testRenderer = renderResult({
      icon: customIcon,
      title: customTitle,
      subtitle: customSubtitle,
      extra: customExtra,
      titleText: 'Fallback Title',
      subtitleText: 'Fallback Sub',
    });

    expect(testRenderer.root.findByProps({ testID: 'custom-icon' })).toBeTruthy();
    expect(testRenderer.root.findByProps({ testID: 'custom-title' })).toBeTruthy();
    expect(testRenderer.root.findByProps({ testID: 'custom-subtitle' })).toBeTruthy();
    expect(testRenderer.root.findByProps({ testID: 'custom-extra' })).toBeTruthy();

    const tree = JSON.stringify(testRenderer.toJSON());
    expect(tree).not.toContain('Fallback Title');
    expect(tree).not.toContain('Fallback Sub');
  });

  it('applies styles overrides for slots', () => {
    const iconContainerStyle = { opacity: 0.81 };
    const titleStyle = { opacity: 0.82 };
    const subtitleStyle = { opacity: 0.83 };
    const extraStyle = { opacity: 0.84 };

    const testRenderer = renderResult({
      titleText: 'Title',
      subtitleText: 'Sub',
      extra: <RNText>Action</RNText>,
      styles: {
        iconContainer: iconContainerStyle,
        title: titleStyle,
        subtitle: subtitleStyle,
        extra: extraStyle,
      },
    });

    const findWithStyle = (marker: Record<string, unknown>) =>
      testRenderer.root.findAll((node) => {
        const style = node.props.style;
        if (style === marker) return true;
        if (Array.isArray(style)) {
          return style.some(
            (s) => s === marker || (s && typeof s === 'object' && 'opacity' in s && s.opacity === marker.opacity),
          );
        }
        return false;
      });

    expect(findWithStyle(iconContainerStyle).length).toBeGreaterThanOrEqual(1);
    expect(findWithStyle(titleStyle).length).toBeGreaterThanOrEqual(1);
    expect(findWithStyle(subtitleStyle).length).toBeGreaterThanOrEqual(1);
    expect(findWithStyle(extraStyle).length).toBeGreaterThanOrEqual(1);
  });

  it('exports Result from the package entry', () => {
    jest.isolateModules(() => {
      jest.doMock('react-native-gesture-handler', () => ({
        GestureHandlerRootView: ({ children }: { children: React.ReactNode }) => children,
      }));
      jest.doMock('@react-navigation/material-top-tabs', () => ({
        createMaterialTopTabNavigator: () => ({
          Navigator: 'Navigator',
          Screen: 'Screen',
        }),
      }));
      jest.doMock('react-native-reanimated', () => {
        const ReactNative = require('react-native');

        return {
          __esModule: true,
          default: {
            View: ReactNative.View,
            createAnimatedComponent: (Component: unknown) => Component,
          },
          createAnimatedComponent: (Component: unknown) => Component,
          interpolate: (value: number) => value,
          useAnimatedStyle: (updater: () => Record<string, unknown>) => updater(),
          useSharedValue: (value: number) => ({ value }),
          withTiming: (value: number) => value,
        };
      });

      const packageExports = require('../src');

      expect(typeof packageExports.Result).toBe('function');
    });
  });
});
