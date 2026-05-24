import React from 'react';
import { View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Divider } from '../src/Divider';
function renderDivider(props: Partial<React.ComponentProps<typeof Divider>> = {}) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><Divider {...props}>Budget</Divider></>);
  });
  return testRenderer!;
}
describe('Divider', () => {
  it('renders horizontal divider by default with content', () => {
    const testRenderer = renderDivider();
    const tree = JSON.stringify(testRenderer.toJSON());
    expect(tree).toContain('Budget');
    expect(testRenderer.root.findAllByType(View)).toHaveLength(4);
  });
  it('renders vertical divider without content node', () => {
    const testRenderer = renderDivider({
      direction: 'vertical'
    });
    expect(testRenderer.root.findAllByType(View)).toHaveLength(1);
  });
});
