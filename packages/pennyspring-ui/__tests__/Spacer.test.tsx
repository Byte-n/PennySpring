import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Spacer } from '../src/Spacer';

function render(element: React.ReactElement) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<>{element}</>);
  });
  return testRenderer!;
}

function flattenStyle(style: unknown) {
  const styles = Array.isArray(style) ? style : [style];
  return Object.assign({}, ...styles);
}

describe('Spacer', () => {
  it('defaults to flex 1 when no props given', () => {
    const testRenderer = render(<Spacer />);
    const root = testRenderer.root.findByProps({ testID: 'spacer' });
    const style = flattenStyle(root.props.style);
    expect(style.flex).toBe(1);
  });

  it('uses custom flex value', () => {
    const testRenderer = render(<Spacer flex={2} />);
    const root = testRenderer.root.findByProps({ testID: 'spacer' });
    const style = flattenStyle(root.props.style);
    expect(style.flex).toBe(2);
  });

  it('renders fixed size with width and height', () => {
    const testRenderer = render(<Spacer size={16} />);
    const root = testRenderer.root.findByProps({ testID: 'spacer' });
    const style = flattenStyle(root.props.style);
    expect(style.width).toBe(16);
    expect(style.height).toBe(16);
    expect(style.flex).toBeUndefined();
  });

  it('applies min constraint', () => {
    const testRenderer = render(<Spacer min={8} />);
    const root = testRenderer.root.findByProps({ testID: 'spacer' });
    const style = flattenStyle(root.props.style);
    expect(style.minWidth).toBe(8);
    expect(style.minHeight).toBe(8);
  });

  it('applies max constraint', () => {
    const testRenderer = render(<Spacer max={32} />);
    const root = testRenderer.root.findByProps({ testID: 'spacer' });
    const style = flattenStyle(root.props.style);
    expect(style.maxWidth).toBe(32);
    expect(style.maxHeight).toBe(32);
  });

  it('combines flex with min and max', () => {
    const testRenderer = render(<Spacer flex={1} min={8} max={64} />);
    const root = testRenderer.root.findByProps({ testID: 'spacer' });
    const style = flattenStyle(root.props.style);
    expect(style.flex).toBe(1);
    expect(style.minWidth).toBe(8);
    expect(style.minHeight).toBe(8);
    expect(style.maxWidth).toBe(64);
    expect(style.maxHeight).toBe(64);
  });

  it('merges external style', () => {
    const testRenderer = render(<Spacer style={{ opacity: 0.5 }} />);
    const root = testRenderer.root.findByProps({ testID: 'spacer' });
    const style = flattenStyle(root.props.style);
    expect(style.opacity).toBe(0.5);
  });
});
