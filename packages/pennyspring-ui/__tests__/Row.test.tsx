import React from 'react';
import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Row } from '../src/Row';

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

describe('Row', () => {
  it('renders children in a horizontal flex container', () => {
    const testRenderer = render(
      <Row>
        <Text>A</Text>
        <Text>B</Text>
      </Row>,
    );
    const root = testRenderer.root.findByProps({ testID: 'row' });
    const style = flattenStyle(root.props.style);
    expect(style.flexDirection).toBe('row');
  });

  it('defaults alignItems to center', () => {
    const testRenderer = render(<Row><Text>A</Text></Row>);
    const root = testRenderer.root.findByProps({ testID: 'row' });
    const style = flattenStyle(root.props.style);
    expect(style.alignItems).toBe('center');
  });

  it('applies align prop', () => {
    const testRenderer = render(<Row align="start"><Text>A</Text></Row>);
    const root = testRenderer.root.findByProps({ testID: 'row' });
    const style = flattenStyle(root.props.style);
    expect(style.alignItems).toBe('flex-start');
  });

  it('applies justify prop', () => {
    const testRenderer = render(<Row justify="between"><Text>A</Text></Row>);
    const root = testRenderer.root.findByProps({ testID: 'row' });
    const style = flattenStyle(root.props.style);
    expect(style.justifyContent).toBe('space-between');
  });

  it('applies gap prop', () => {
    const testRenderer = render(<Row gap={12}><Text>A</Text></Row>);
    const root = testRenderer.root.findByProps({ testID: 'row' });
    const style = flattenStyle(root.props.style);
    expect(style.gap).toBe(12);
  });

  it('applies wrap prop', () => {
    const testRenderer = render(<Row wrap><Text>A</Text></Row>);
    const root = testRenderer.root.findByProps({ testID: 'row' });
    const style = flattenStyle(root.props.style);
    expect(style.flexWrap).toBe('wrap');
  });

  it('merges external style', () => {
    const testRenderer = render(
      <Row style={{ marginTop: 10 }}><Text>A</Text></Row>,
    );
    const root = testRenderer.root.findByProps({ testID: 'row' });
    const style = flattenStyle(root.props.style);
    expect(style.marginTop).toBe(10);
  });
});
