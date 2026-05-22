import React from 'react';
import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Column } from '../src/Column';

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

describe('Column', () => {
  it('renders children in a vertical flex container', () => {
    const testRenderer = render(
      <Column>
        <Text>A</Text>
        <Text>B</Text>
      </Column>,
    );
    const root = testRenderer.root.findByProps({ testID: 'column' });
    const style = flattenStyle(root.props.style);
    expect(style.flexDirection).toBe('column');
  });

  it('defaults alignItems to stretch', () => {
    const testRenderer = render(<Column><Text>A</Text></Column>);
    const root = testRenderer.root.findByProps({ testID: 'column' });
    const style = flattenStyle(root.props.style);
    expect(style.alignItems).toBe('stretch');
  });

  it('applies align prop', () => {
    const testRenderer = render(<Column align="center"><Text>A</Text></Column>);
    const root = testRenderer.root.findByProps({ testID: 'column' });
    const style = flattenStyle(root.props.style);
    expect(style.alignItems).toBe('center');
  });

  it('applies justify prop', () => {
    const testRenderer = render(
      <Column justify="end"><Text>A</Text></Column>,
    );
    const root = testRenderer.root.findByProps({ testID: 'column' });
    const style = flattenStyle(root.props.style);
    expect(style.justifyContent).toBe('flex-end');
  });

  it('applies gap prop', () => {
    const testRenderer = render(<Column gap={8}><Text>A</Text></Column>);
    const root = testRenderer.root.findByProps({ testID: 'column' });
    const style = flattenStyle(root.props.style);
    expect(style.gap).toBe(8);
  });

  it('merges external style', () => {
    const testRenderer = render(
      <Column style={{ padding: 16 }}><Text>A</Text></Column>,
    );
    const root = testRenderer.root.findByProps({ testID: 'column' });
    const style = flattenStyle(root.props.style);
    expect(style.padding).toBe(16);
  });
});
