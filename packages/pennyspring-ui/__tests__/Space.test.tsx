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
function getSpaceRoot(testRenderer: renderer.ReactTestRenderer) {
  return testRenderer.root.findByType(View);
}
describe('Space', () => {
  it('stretches the root container when block is enabled', () => {
    const testRenderer = renderSpace({
      block: true
    });
    const rootStyle = flattenStyle(getSpaceRoot(testRenderer).props.style);
    expect(rootStyle.alignSelf).toBe('stretch');
  });
  it('does not bind built-in press behavior', () => {
    const testRenderer = renderSpace();
    expect(testRenderer.root.findAllByType(Pressable)).toHaveLength(0);
  });
});
