import React from 'react';
import { ActivityIndicator } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Loading } from '../src/Loading';
import { Row } from '../src/Row';
import { Column } from '../src/Column';
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
  it('defaults size to normal when size is not provided', () => {
    const defaultRenderer = renderLoading();
    const normalRenderer = renderLoading({ size: 'normal' });
    const defaultIndicator = defaultRenderer.root.findByType(ActivityIndicator);
    const normalIndicator = normalRenderer.root.findByType(ActivityIndicator);
    expect(defaultIndicator.props.size).toBe(normalIndicator.props.size);
  });
  it('uses Row layout by default', () => {
    const testRenderer = renderLoading();
    expect(() => testRenderer.root.findByType(Row)).not.toThrow();
    expect(() => testRenderer.root.findByType(Column)).toThrow();
  });
  it('uses Column layout when vertical is true', () => {
    const testRenderer = renderLoading({ vertical: true });
    expect(() => testRenderer.root.findByType(Column)).not.toThrow();
    expect(() => testRenderer.root.findByType(Row)).toThrow();
  });
  it('renders custom indicator instead of default ActivityIndicator', () => {
    const CustomIndicator = () => null;
    const testRenderer = renderLoading({
      indicator: <CustomIndicator />,
    });
    expect(() => testRenderer.root.findByType(CustomIndicator)).not.toThrow();
    expect(() => testRenderer.root.findByType(ActivityIndicator)).toThrow();
  });
  it('passes animating prop to ActivityIndicator', () => {
    const testRenderer = renderLoading({ animating: false });
    const indicator = testRenderer.root.findByType(ActivityIndicator);
    expect(indicator.props.animating).toBe(false);
  });
  it('passes hidesWhenStopped prop to ActivityIndicator', () => {
    const testRenderer = renderLoading({ hidesWhenStopped: false });
    const indicator = testRenderer.root.findByType(ActivityIndicator);
    expect(indicator.props.hidesWhenStopped).toBe(false);
  });
});
