import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { SegmentedControl } from '../src/TopTabNavigator/SegmentedControl';
jest.mock('react-native-reanimated', () => {
  const ReactNative = require('react-native');
  return {
    __esModule: true,
    default: {
      View: ReactNative.View
    },
    interpolate: (value: number) => value,
    useAnimatedStyle: (updater: () => Record<string, unknown>) => updater(),
    useSharedValue: (value: number) => ({
      value
    }),
    withTiming: (value: number) => value
  };
});
const routes = [{
  key: 'detail',
  name: 'Detail',
  params: undefined
}, {
  key: 'chart',
  name: 'Chart',
  params: undefined
}];
describe('SegmentedControl', () => {
  it('renders tab labels from routes', () => {
    let testRenderer: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(<><SegmentedControl descriptors={{
          detail: {
            options: {
              title: '明细'
            }
          },
          chart: {
            options: {
              title: '图表'
            }
          }
        }} navigation={{
          navigate: jest.fn()
        }} position={{
          value: 0
        }} state={{
          index: 0,
          routes
        }} /></>);
    });
    const treeString = JSON.stringify(testRenderer!.toJSON());
    expect(treeString).toContain('明细');
    expect(treeString).toContain('图表');
  });
  it('keeps tab labels on a single line', () => {
    let testRenderer: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(<><SegmentedControl descriptors={{
          detail: {
            options: {
              title: '明细'
            }
          },
          chart: {
            options: {
              title: '图表'
            }
          }
        }} navigation={{
          navigate: jest.fn()
        }} position={{
          value: 0
        }} state={{
          index: 0,
          routes
        }} /></>);
    });
    const labels = testRenderer!.root.findAllByProps({
      testID: 'top-tab-segment-label'
    });
    expect(labels[0]?.props.numberOfLines).toBe(1);
  });
});
