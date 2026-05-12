import React from 'react';
import { Pressable, Text, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Space } from '../src/Space';
function renderSpace(props: Partial<React.ComponentProps<typeof Space>> = {}) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><Space {...props}>
          <Text>Income</Text>
          {null}
          <Text>Expense</Text>
          {undefined}
          <Text>Balance</Text>
        </Space></>);
  });
  return testRenderer!;
}
function flattenStyle(style: unknown) {
  const styles = Array.isArray(style) ? style : [style];
  return Object.assign({}, ...styles);
}
function findNodesWithStyle(testRenderer: renderer.ReactTestRenderer, markerStyle: Record<string, unknown>) {
  return testRenderer.root.findAll(node => {
    const style = node.props.style;
    return node.type === View && Array.isArray(style) && style.includes(markerStyle);
  });
}
function getSpaceRoot(testRenderer: renderer.ReactTestRenderer) {
  return testRenderer.root.findByType(View);
}
function getSpaceItems(testRenderer: renderer.ReactTestRenderer) {
  return getSpaceRoot(testRenderer).findAll(node => {
    return node.type === View && node !== getSpaceRoot(testRenderer);
  });
}
describe('Space', () => {
  it('renders valid children horizontally by default', () => {
    const testRenderer = renderSpace();
    const rootStyle = flattenStyle(getSpaceRoot(testRenderer).props.style);
    expect(rootStyle.flexDirection).toBe('row');
    expect(getSpaceItems(testRenderer)).toHaveLength(3);
  });
  it('renders valid children vertically when direction is vertical', () => {
    const testRenderer = renderSpace({
      direction: 'vertical'
    });
    const rootStyle = flattenStyle(getSpaceRoot(testRenderer).props.style);
    expect(rootStyle.flexDirection).toBe('column');
    expect(getSpaceItems(testRenderer)).toHaveLength(3);
  });
  it('does not add trailing spacing to the last item', () => {
    const testRenderer = renderSpace();
    const lastItemStyle = flattenStyle(getSpaceItems(testRenderer)[2].props.style);
    expect(lastItemStyle.marginRight).toBeUndefined();
    expect(lastItemStyle.marginBottom).toBeUndefined();
  });
  it('maps align and justify props to flexbox styles', () => {
    const testRenderer = renderSpace({
      align: 'center',
      justify: 'between'
    });
    const rootStyle = flattenStyle(getSpaceRoot(testRenderer).props.style);
    expect(rootStyle.alignItems).toBe('center');
    expect(rootStyle.justifyContent).toBe('space-between');
  });
  it('stretches the root container when block is enabled', () => {
    const testRenderer = renderSpace({
      block: true
    });
    const rootStyle = flattenStyle(getSpaceRoot(testRenderer).props.style);
    expect(rootStyle.alignSelf).toBe('stretch');
  });
  it('applies root and item styles after token styles', () => {
    const rootStyle = {
      flex: 1
    };
    const itemStyle = {
      marginRight: 0
    };
    const testRenderer = renderSpace({
      style: rootStyle,
      styles: {
        item: itemStyle
      }
    });
    const root = getSpaceRoot(testRenderer);
    const firstItem = findNodesWithStyle(testRenderer, itemStyle)[0];
    expect(root.props.style).toContain(rootStyle);
    expect(flattenStyle(firstItem.props.style).marginRight).toBe(0);
  });
  it('does not bind built-in press behavior', () => {
    const testRenderer = renderSpace();
    expect(testRenderer.root.findAllByType(Pressable)).toHaveLength(0);
    expect(testRenderer.root.findAll(node => node.props.accessibilityRole === 'button')).toHaveLength(0);
  });
});
