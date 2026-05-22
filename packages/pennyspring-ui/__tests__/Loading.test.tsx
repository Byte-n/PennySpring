import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Loading } from '../src/Loading';
import type { LoadingProps } from '../src/Loading';
function flattenStyle(style: unknown) {
  const styles = Array.isArray(style) ? style : [style];
  return Object.assign({}, ...styles);
}
function renderLoading(props: Partial<LoadingProps> = {}) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><Loading {...props} /></>);
  });
  return testRenderer!;
}
describe('Loading', () => {
  it('renders default activity indicator', () => {
    const testRenderer = renderLoading();
    expect(testRenderer.root.findByType(ActivityIndicator)).toBeTruthy();
  });
  it('supports small and large size for indicator', () => {
    const smallRenderer = renderLoading({
      size: 'small'
    });
    const largeRenderer = renderLoading({
      size: 'large'
    });
    const smallIndicator = smallRenderer.root.findByType(ActivityIndicator);
    const largeIndicator = largeRenderer.root.findByType(ActivityIndicator);
    expect(typeof smallIndicator.props.size).toBe('number');
    expect(typeof largeIndicator.props.size).toBe('number');
    expect(largeIndicator.props.size).toBeGreaterThan(smallIndicator.props.size);
  });
  it('renders loading text when text is provided', () => {
    const testRenderer = renderLoading({
      text: 'Loading data...'
    });
    expect(JSON.stringify(testRenderer.toJSON())).toContain('Loading data...');
  });
  it('switches to vertical layout when vertical is true', () => {
    const testRenderer = renderLoading({
      text: 'Loading',
      vertical: true
    });
    const root = testRenderer.root.findByType(View);
    const rootStyle = flattenStyle(root.props.style);
    expect(rootStyle.flexDirection).toBe('column');
  });
  it('renders custom indicator node', () => {
    const indicatorStyle = {
      opacity: 0.42
    };
    const testRenderer = renderLoading({
      indicator: <View style={indicatorStyle} />
    });
    expect(testRenderer.root.findAllByType(ActivityIndicator)).toHaveLength(0);
    const customIndicator = testRenderer.root.find(node => {
      if (node.type !== View) {
        return false;
      }
      const style = flattenStyle(node.props.style);
      return style.opacity === indicatorStyle.opacity;
    });
    expect(customIndicator).toBeTruthy();
  });
});
