import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Text } from '../src/Text';
function renderText(props: React.ComponentProps<typeof Text>) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><Text {...props} /></>);
  });
  return testRenderer!;
}
describe('Text', () => {
  describe('children rendering', () => {
    it('renders string children', () => {
      const testRenderer = renderText({
        children: 'Hello'
      });
      const textNode = testRenderer.root.findByType(Text);
      const rnText = textNode.findByType('Text' as unknown as React.ComponentType);
      expect(rnText.props.children).toBe('Hello');
    });
    it('renders nested Text children', () => {
      const testRenderer = renderText({
        children: <>
            <Text style={{
            fontWeight: 'bold'
          }}>Bold</Text>
            {' normal'}
          </>
      });
      const nestedText = testRenderer.root.findAllByType(Text).find(node => node.props.children === 'Bold');
      expect(nestedText).toBeDefined();
    });
  });
  describe('native props forwarding', () => {
    it('forwards numberOfLines to underlying RN Text', () => {
      const testRenderer = renderText({
        size: 'md',
        numberOfLines: 2,
        children: 'Hello'
      });
      const textNode = testRenderer.root.findByType(Text);
      const rnText = textNode.findByType('Text' as unknown as React.ComponentType);
      expect(rnText.props.numberOfLines).toBe(2);
    });
    it('forwards onPress to underlying RN Text', () => {
      const onPress = jest.fn();
      const testRenderer = renderText({
        size: 'md',
        onPress,
        children: 'Hello'
      });
      const textNode = testRenderer.root.findByType(Text);
      const rnText = textNode.findByType('Text' as unknown as React.ComponentType);
      expect(rnText.props.onPress).toBe(onPress);
    });
  });
});
