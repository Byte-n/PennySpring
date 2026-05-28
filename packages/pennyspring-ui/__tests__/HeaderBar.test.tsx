import React from 'react';
import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { HeaderBar } from '../src/TopTabNavigator/HeaderBar';

const routes = [{
  key: 'detail',
  name: 'Detail',
  params: undefined
}, {
  key: 'chart',
  name: 'Chart',
  params: undefined
}];
describe('HeaderBar', () => {
  it('renders left and right action slots around segmented tabs', () => {
    let testRenderer: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(<><HeaderBar descriptors={{
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
        }} leftActions={<Text>left action</Text>} navigation={{
          navigate: jest.fn()
        }} rightActions={<Text>right action</Text>} state={{
          index: 0,
          routes
        }} /></>);
    });
    const treeString = JSON.stringify(testRenderer!.toJSON());
    expect(treeString).toContain('left action');
    expect(treeString).toContain('明细');
    expect(treeString).toContain('图表');
    expect(treeString).toContain('right action');
  });
});

describe('HeaderBar style extraction', () => {
  it('exports useHeaderBarStyles from style/index.ts', () => {
    const styleModule = require('../src/TopTabNavigator/style/index');
    expect(styleModule.useHeaderBarStyles).toBeDefined();
    expect(typeof styleModule.useHeaderBarStyles).toBe('function');
  });
});

describe('HeaderBarProps exported from types.ts', () => {
  it('types.ts module resolves without error', () => {
    const typesModule = require('../src/TopTabNavigator/types');
    expect(typesModule).toBeDefined();
  });
});
