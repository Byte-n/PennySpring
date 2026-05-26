import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { Text } from '../src/Text';

function renderText(props: React.ComponentProps<typeof Text>) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(
      <ThemeProvider>
        <Text {...props} />
      </ThemeProvider>,
    );
  });
  return testRenderer!;
}

function getRNText(testRenderer: renderer.ReactTestRenderer) {
  const textNode = testRenderer.root.findByType(Text);
  return textNode.findByType('Text' as unknown as React.ComponentType);
}

describe('Text', () => {
  describe('children rendering', () => {
    it('renders string children', () => {
      const testRenderer = renderText({
        children: 'Hello',
      });
      const rnText = getRNText(testRenderer);
      expect(rnText.props.children).toBe('Hello');
    });
    it('renders nested Text children', () => {
      const testRenderer = renderText({
        children: (
          <>
            <Text
              style={{
                fontWeight: 'bold',
              }}
            >
              Bold
            </Text>
            {' normal'}
          </>
        ),
      });
      const nestedText = testRenderer.root
        .findAllByType(Text)
        .find(node => node.props.children === 'Bold');
      expect(nestedText).toBeDefined();
    });
  });
  describe('native props forwarding', () => {
    it('forwards numberOfLines to underlying RN Text', () => {
      const testRenderer = renderText({
        size: 'md',
        numberOfLines: 2,
        children: 'Hello',
      });
      const rnText = getRNText(testRenderer);
      expect(rnText.props.numberOfLines).toBe(2);
    });
    it('forwards onPress to underlying RN Text', () => {
      const onPress = jest.fn();
      const testRenderer = renderText({
        size: 'md',
        onPress,
        children: 'Hello',
      });
      const rnText = getRNText(testRenderer);
      expect(rnText.props.onPress).toBe(onPress);
    });
  });

  describe('color', () => {
    it('supports alias color token names without color prefix', () => {
      const testRenderer = renderText({
        color: 'primary',
        children: 'Hello',
      });
      const rnText = getRNText(testRenderer);

      expect(rnText.props.style[0].color).toBeDefined();
    });

    it('falls back to default text color for unknown runtime color values', () => {
      const testRenderer = renderText({
        color: '#123456' as never,
        children: 'Hello',
      });
      const rnText = getRNText(testRenderer);

      expect(rnText.props.style[0].color).not.toBe('#123456');
    });
  });
});
