import React from 'react';
import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { GeometryReader } from '../src/GeometryReader';

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

describe('GeometryReader', () => {
  it('renders nothing before layout measurement', () => {
    const children = jest.fn(() => <Text>Content</Text>);
    render(<GeometryReader>{children}</GeometryReader>);
    expect(children).not.toHaveBeenCalled();
  });

  it('calls children with geometry after onLayout fires', () => {
    const children = jest.fn(() => <Text>Content</Text>);
    const testRenderer = render(
      <GeometryReader>{children}</GeometryReader>,
    );
    const root = testRenderer.root.findByProps({ testID: 'geometry-reader' });
    act(() => {
      root.props.onLayout({
        nativeEvent: { layout: { width: 200, height: 100 } },
      });
    });
    expect(children).toHaveBeenCalledWith({ width: 200, height: 100 });
  });

  it('has flex 1 by default to fill parent', () => {
    const testRenderer = render(
      <GeometryReader>{() => null}</GeometryReader>,
    );
    const root = testRenderer.root.findByProps({ testID: 'geometry-reader' });
    const style = flattenStyle(root.props.style);
    expect(style.flex).toBe(1);
  });

  it('merges external style', () => {
    const testRenderer = render(
      <GeometryReader style={{ backgroundColor: 'red' }}>
        {() => null}
      </GeometryReader>,
    );
    const root = testRenderer.root.findByProps({ testID: 'geometry-reader' });
    const style = flattenStyle(root.props.style);
    expect(style.backgroundColor).toBe('red');
  });
});
