import React from 'react';
import { ActivityIndicator } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Loading } from '../src/Loading';
import type { LoadingProps } from '../src/Loading';
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
});
