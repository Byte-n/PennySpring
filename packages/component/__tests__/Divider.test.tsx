import React from 'react';
import { View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Divider } from '../src/Divider';
import { Text } from '../src/Text';
function flattenStyle(style: unknown) {
  const styles = Array.isArray(style) ? style : [style];
  return Object.assign({}, ...styles);
}
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
  it('limits one side line length when content position is left or right', () => {
    const left = renderDivider({
      contentPosition: 'left'
    });
    const right = renderDivider({
      contentPosition: 'right'
    });
    const center = renderDivider({
      contentPosition: 'center'
    });
    const leftFirstLineStyle = flattenStyle(left.root.findAllByType(View)[1].props.style);
    const leftSecondLineStyle = flattenStyle(left.root.findAllByType(View)[3].props.style);
    const rightFirstLineStyle = flattenStyle(right.root.findAllByType(View)[1].props.style);
    const rightSecondLineStyle = flattenStyle(right.root.findAllByType(View)[3].props.style);
    const centerFirstLineStyle = flattenStyle(center.root.findAllByType(View)[1].props.style);
    const centerSecondLineStyle = flattenStyle(center.root.findAllByType(View)[3].props.style);
    expect(leftFirstLineStyle.maxWidth).toBe('10%');
    expect(leftSecondLineStyle.maxWidth).toBeUndefined();
    expect(rightFirstLineStyle.maxWidth).toBeUndefined();
    expect(rightSecondLineStyle.maxWidth).toBe('10%');
    expect(centerFirstLineStyle.maxWidth).toBeUndefined();
    expect(centerSecondLineStyle.maxWidth).toBeUndefined();
  });
  it('merges external style overrides after token styles', () => {
    const rootStyle = {
      marginVertical: 0
    };
    const lineStyle = {
      borderTopWidth: 0
    };
    const contentStyle = {
      paddingHorizontal: 0
    };
    const testRenderer = renderDivider({
      style: rootStyle,
      styles: {
        content: contentStyle,
        line: lineStyle
      }
    });
    const root = testRenderer.root.findAllByType(View)[0];
    const line = testRenderer.root.findAllByType(View)[1];
    expect(root.props.style).toContain(rootStyle);
    expect(line.props.style).toContain(lineStyle);
    const contentText = testRenderer.root.findByType(Text);
    expect(flattenStyle(contentText.props.style).paddingHorizontal).toBe(0);
  });
});
