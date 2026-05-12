import React from 'react';
import { Text as RNText, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { defaultSeedToken } from '@pennyspring/theme';
import { derivative } from '@pennyspring/theme/src/algorithms/derivative';
import { formatToken } from '@pennyspring/theme/src/algorithms/formatToken';
import { Empty } from '../src/Empty';

const token = formatToken(derivative(defaultSeedToken, false));

function renderEmpty(props: Partial<React.ComponentProps<typeof Empty>> = {}) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <ThemeProvider>
        <Empty {...props} />
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

function getRootStyle(testRenderer: renderer.ReactTestRenderer) {
  const root = testRenderer.root.findAllByType(View)[0];

  return flattenStyle(root.props.style);
}

function getDefaultIconStyle(testRenderer: renderer.ReactTestRenderer) {
  const iconPlaceholders = testRenderer.root.findAll((node) => {
    if (node.type !== View) {
      return false;
    }

    const style = flattenStyle(node.props.style);
    return style.borderWidth === token.lineWidth && style.borderColor === token.colorBorder;
  });

  return flattenStyle(iconPlaceholders[0].props.style);
}

describe('Empty', () => {
  it('renders default icon and default message text', () => {
    const testRenderer = renderEmpty();

    const tree = JSON.stringify(testRenderer.toJSON());

    expect(tree).toContain('暂无内容');
    expect(getDefaultIconStyle(testRenderer).borderWidth).toBe(token.lineWidth);
  });

  it('maps size to token-driven spacing, icon size and message size', () => {
    const smallEmpty = renderEmpty({ size: 'small' });
    const normalEmpty = renderEmpty();
    const largeEmpty = renderEmpty({ size: 'large' });

    expect(getRootStyle(smallEmpty).gap).toBe(token.marginXS);
    expect(getRootStyle(normalEmpty).gap).toBe(token.marginSM);
    expect(getRootStyle(largeEmpty).gap).toBe(token.marginMD);
    expect(getRootStyle(smallEmpty).paddingVertical).toBe(token.paddingSM);
    expect(getRootStyle(normalEmpty).paddingVertical).toBe(token.paddingMD);
    expect(getRootStyle(largeEmpty).paddingVertical).toBe(token.paddingLG);

    expect(getDefaultIconStyle(smallEmpty).width).toBe(token.fontSizeXL);
    expect(getDefaultIconStyle(normalEmpty).width).toBe(token.fontSizeHeading4);
    expect(getDefaultIconStyle(largeEmpty).width).toBe(token.fontSizeHeading3);

    const smallMessage = smallEmpty.root.findByType(RNText);
    const normalMessage = normalEmpty.root.findByType(RNText);
    const largeMessage = largeEmpty.root.findByType(RNText);

    expect(flattenStyle(smallMessage.props.style).fontSize).toBe(token.fontSizeSM);
    expect(flattenStyle(normalMessage.props.style).fontSize).toBe(token.fontSize);
    expect(flattenStyle(largeMessage.props.style).fontSize).toBe(token.fontSizeLG);
  });

  it('supports overriding icon and message by external nodes', () => {
    const customIconStyle = { opacity: 0.61 };
    const customMessageStyle = { opacity: 0.62 };
    const testRenderer = renderEmpty({
      icon: <RNText style={customIconStyle}>Icon</RNText>,
      message: <RNText style={customMessageStyle}>Custom Message</RNText>,
      messageText: 'Fallback Message',
    });

    const tree = JSON.stringify(testRenderer.toJSON());

    expect(tree).toContain('Custom Message');
    expect(tree).not.toContain('Fallback Message');
    expect(findNodesWithStyle(testRenderer, customIconStyle).length).toBeGreaterThan(0);
    expect(findNodesWithStyle(testRenderer, customMessageStyle).length).toBeGreaterThan(0);
  });

  it('applies styles overrides for icon container and message', () => {
    const iconContainerStyle = { opacity: 0.71 };
    const messageStyle = { opacity: 0.72 };
    const testRenderer = renderEmpty({
      messageText: 'No records found',
      styles: {
        iconContainer: iconContainerStyle,
        message: messageStyle,
      },
    });

    expect(findNodesWithStyle(testRenderer, iconContainerStyle).length).toBeGreaterThan(0);
    expect(findNodesWithStyle(testRenderer, messageStyle).length).toBeGreaterThan(0);
  });

  it('exports Empty from the package entry', () => {
    jest.isolateModules(() => {
      jest.doMock('react-native-gesture-handler', () => {
        const ReactLocal = require('react');
        const { View: ReactNativeView } = require('react-native');

        return {
          GestureHandlerRootView: ReactLocal.forwardRef((props: { children?: React.ReactNode }, ref: React.Ref<unknown>) => (
            <ReactNativeView ref={ref}>{props.children}</ReactNativeView>
          )),
        };
      });
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
          },
          createAnimatedComponent: (Component: React.ComponentType<unknown>) => {
            return React.forwardRef((props, ref) => <Component {...props} ref={ref} />);
          },
          interpolate: (value: number) => value,
          useAnimatedStyle: (updater: () => Record<string, unknown>) => updater(),
          useSharedValue: (value: number) => ({ value }),
          withTiming: (value: number) => value,
        };
      });

      const packageExports = require('../src');

      expect(typeof packageExports.Empty).toBe('function');
    });
  });
});
