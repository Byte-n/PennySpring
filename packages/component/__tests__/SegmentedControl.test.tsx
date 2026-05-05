import React from 'react';
import renderer, { act } from 'react-test-renderer';
import type { Animated as ReactNativeAnimated } from 'react-native';
import { ThemeProvider } from '@pennyspring/theme';
import { SegmentedControl } from '../src/TopTabNavigator/SegmentedControl';

jest.mock('react-native-reanimated', () => {
  const ReactNative = require('react-native');

  return {
    __esModule: true,
    default: {
      View: ReactNative.View,
    },
    interpolate: (value: number) => value,
    useAnimatedStyle: (updater: () => Record<string, unknown>) => updater(),
    useSharedValue: (value: number) => ({ value }),
    withTiming: (value: number) => value,
  };
});

const routes = [
  { key: 'detail', name: 'Detail', params: undefined },
  { key: 'chart', name: 'Chart', params: undefined },
];

describe('SegmentedControl', () => {
  it('renders tab labels from routes', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ThemeProvider>
          <SegmentedControl
            descriptors={{
              detail: {
                options: { title: '明细' },
              },
              chart: {
                options: { title: '图表' },
              },
            }}
            navigation={{ navigate: jest.fn() }}
            position={{ value: 0 }}
            state={{ index: 0, routes }}
          />
        </ThemeProvider>
      );
    });

    const treeString = JSON.stringify(testRenderer!.toJSON());

    expect(treeString).toContain('明细');
    expect(treeString).toContain('图表');
  });

  it('marks the selected tab label as active', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ThemeProvider>
          <SegmentedControl
            descriptors={{
              detail: {
                options: { title: '明细' },
              },
              chart: {
                options: { title: '图表' },
              },
            }}
            navigation={{ navigate: jest.fn() }}
            position={{ value: 1 }}
            state={{ index: 1, routes }}
          />
        </ThemeProvider>
      );
    });

    const labels = testRenderer!.root.findAllByProps({
      testID: 'top-tab-segment-label',
    });

    const detailLabel = labels.find((label) => label.props.children === '明细');
    const chartLabel = labels.find((label) => label.props.children === '图表');

    expect(chartLabel?.props.accessibilityState.selected).toBe(true);
    expect(detailLabel?.props.accessibilityState.selected).toBe(false);
  });

  it('positions tab options above the sliding indicator', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ThemeProvider>
          <SegmentedControl
            descriptors={{
              detail: {
                options: { title: '明细' },
              },
              chart: {
                options: { title: '图表' },
              },
            }}
            navigation={{ navigate: jest.fn() }}
            position={{ value: 0 }}
            state={{ index: 0, routes }}
          />
        </ThemeProvider>
      );
    });

    const tabOptions = testRenderer!.root.findAllByProps({
      accessibilityRole: 'tab',
    });
    const firstOptionStyles = Array.isArray(tabOptions[0]?.props.style)
      ? tabOptions[0]?.props.style
      : [tabOptions[0]?.props.style];
    const layeredOptionStyle = firstOptionStyles.find(
      (style: Record<string, unknown> | undefined) => style?.zIndex
    );

    expect(layeredOptionStyle).toEqual(
      expect.objectContaining({
        position: 'relative',
        zIndex: expect.any(Number),
      })
    );
  });

  it('sizes tabs from their content instead of forcing equal widths', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ThemeProvider>
          <SegmentedControl
            descriptors={{
              detail: {
                options: { title: '明细' },
              },
              chart: {
                options: { title: '图表' },
              },
            }}
            navigation={{ navigate: jest.fn() }}
            position={{ value: 0 }}
            state={{ index: 0, routes }}
          />
        </ThemeProvider>
      );
    });

    const track = testRenderer!.root
      .findAll((node) => String(node.type) === 'View')
      .find((view) => {
        const styles = Array.isArray(view.props.style)
          ? view.props.style
          : [view.props.style];

        return styles.some(
          (style: Record<string, unknown> | undefined) =>
            style?.flexDirection === 'row'
        );
      });
    const trackStyles = Array.isArray(track?.props.style)
      ? track?.props.style
      : [track?.props.style];
    const tabOptions = testRenderer!.root.findAllByProps({
      accessibilityRole: 'tab',
    });
    const firstOptionStyles = Array.isArray(tabOptions[0]?.props.style)
      ? tabOptions[0]?.props.style
      : [tabOptions[0]?.props.style];

    expect(trackStyles).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ width: '100%' })])
    );
    expect(firstOptionStyles).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ flex: 1 })])
    );
  });

  it('keeps tab labels on a single line', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ThemeProvider>
          <SegmentedControl
            descriptors={{
              detail: {
                options: { title: '明细' },
              },
              chart: {
                options: { title: '图表' },
              },
            }}
            navigation={{ navigate: jest.fn() }}
            position={{ value: 0 }}
            state={{ index: 0, routes }}
          />
        </ThemeProvider>
      );
    });

    const labels = testRenderer!.root.findAllByProps({
      testID: 'top-tab-segment-label',
    });

    expect(labels[0]?.props.numberOfLines).toBe(1);
  });

  it('sizes the indicator from the selected tab layout', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ThemeProvider>
          <SegmentedControl
            descriptors={{
              detail: {
                options: { title: '明细' },
              },
              chart: {
                options: { title: '图表数据' },
              },
            }}
            navigation={{ navigate: jest.fn() }}
            position={{ value: 1 }}
            state={{ index: 1, routes }}
          />
        </ThemeProvider>
      );
    });

    const detailOption = testRenderer!.root.findByProps({
      testID: 'top-tab-segment-option-detail',
    });
    const chartOption = testRenderer!.root.findByProps({
      testID: 'top-tab-segment-option-chart',
    });

    act(() => {
      detailOption.props.onLayout({
        nativeEvent: { layout: { height: 33, width: 48, x: 0, y: 0 } },
      });
    });

    act(() => {
      chartOption.props.onLayout({
        nativeEvent: { layout: { height: 33, width: 80, x: 48, y: 0 } },
      });
    });

    const indicator = testRenderer!.root.findByProps({
      testID: 'top-tab-segment-indicator',
    });
    const indicatorStyles = Array.isArray(indicator?.props.style)
      ? indicator?.props.style
      : [indicator?.props.style];
    const layoutStyle = indicatorStyles.find(
      (style: Record<string, unknown> | undefined) => style?.transform
    );

    expect(layoutStyle).toEqual({
      transform: [{ translateX: 48 }],
      width: 80,
    });
  });

  it('uses animated interpolation output as the translateX value', () => {
    const interpolatedTranslateX = { translateX: 0 } as unknown as ReactNativeAnimated.AnimatedNode;
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ThemeProvider>
          <SegmentedControl
            descriptors={{
              detail: {
                options: { title: '明细' },
              },
              chart: {
                options: { title: '图表' },
              },
            }}
            navigation={{ navigate: jest.fn() }}
            position={{
              interpolate: () => interpolatedTranslateX,
              value: 0,
            }}
            state={{ index: 0, routes }}
          />
        </ThemeProvider>
      );
    });

    const indicator = testRenderer!.root.findByProps({
      testID: 'top-tab-segment-indicator',
    });
    const styles = Array.isArray(indicator?.props.style)
      ? indicator?.props.style
      : [indicator?.props.style];
    const animatedStyle = styles.find(
      (style: Record<string, unknown> | undefined) => style?.transform
    );

    expect(animatedStyle.transform).toEqual([
      {
        translateX: interpolatedTranslateX,
      },
    ]);
  });
});
