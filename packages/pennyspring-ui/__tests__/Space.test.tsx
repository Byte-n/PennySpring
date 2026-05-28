import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
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
function renderThemedSpace(props: Partial<React.ComponentProps<typeof Space>> = {}) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(
      <ThemeProvider
        config={{
          token: {
            paddingXXS: 3,
            paddingXS: 5,
            paddingSM: 7,
          },
        }}
      >
        <Space {...props}>
          <Text>Income</Text>
          <Text>Expense</Text>
        </Space>
      </ThemeProvider>,
    );
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
  it.each([
    ['small', 3],
    ['normal', 5],
    ['large', 7],
  ] as const)('maps %s size to layout gap token', (size, expectedGap) => {
    const testRenderer = renderThemedSpace({
      size,
    });
    const itemStyles = testRenderer.root
      .findAllByType(View)
      .map(node => StyleSheet.flatten(node.props.style))
      .filter(style => style?.marginRight !== undefined);

    expect(itemStyles[0].marginRight).toBe(expectedGap);
  });

  it.each([
    ['small', 3],
    ['normal', 5],
    ['large', 7],
  ] as const)('maps %s size to half-gap in vertical direction', (size, expectedGap) => {
    const testRenderer = renderThemedSpace({
      direction: 'vertical',
      size,
    });
    const itemStyles = testRenderer.root
      .findAllByType(View)
      .map(node => StyleSheet.flatten(node.props.style))
      .filter(style => style?.marginBottom !== undefined);

    expect(itemStyles[0].marginBottom).toBe(expectedGap / 2);
  });

  it('defaults to horizontal direction with row layout', () => {
    const testRenderer = renderSpace();
    const rootStyle = flattenStyle(getSpaceRoot(testRenderer).props.style);
    expect(rootStyle.flexDirection).toBe('row');
  });

  it('renders vertical direction as column layout', () => {
    const testRenderer = renderSpace({ direction: 'vertical' });
    const rootStyle = flattenStyle(getSpaceRoot(testRenderer).props.style);
    expect(rootStyle.flexDirection).toBe('column');
  });

  it.each([
    ['start' as const, 'flex-start'],
    ['end' as const, 'flex-end'],
    ['center' as const, 'center'],
    ['baseline' as const, 'baseline'],
  ])('maps align=%s to alignItems %s', (align, expected) => {
    const testRenderer = renderSpace({ align });
    const rootStyle = flattenStyle(getSpaceRoot(testRenderer).props.style);
    expect(rootStyle.alignItems).toBe(expected);
  });

  it.each([
    ['start' as const, 'flex-start'],
    ['end' as const, 'flex-end'],
    ['center' as const, 'center'],
    ['between' as const, 'space-between'],
    ['around' as const, 'space-around'],
    ['evenly' as const, 'space-evenly'],
  ])('maps justify=%s to justifyContent %s', (justify, expected) => {
    const testRenderer = renderSpace({ justify });
    const rootStyle = flattenStyle(getSpaceRoot(testRenderer).props.style);
    expect(rootStyle.justifyContent).toBe(expected);
  });

  it('enables flexWrap when wrap is true in horizontal direction', () => {
    const testRenderer = renderSpace({ wrap: true });
    const rootStyle = flattenStyle(getSpaceRoot(testRenderer).props.style);
    expect(rootStyle.flexWrap).toBe('wrap');
  });

  it('does not enable flexWrap when wrap is true in vertical direction', () => {
    const testRenderer = renderSpace({ direction: 'vertical', wrap: true });
    const rootStyle = flattenStyle(getSpaceRoot(testRenderer).props.style);
    expect(rootStyle.flexWrap).toBeUndefined();
  });

  it('adds half-gap vertical margins when wrap is enabled', () => {
    const testRenderer = renderThemedSpace({ wrap: true, size: 'normal' });
    const items = testRenderer.root
      .findAllByType(View)
      .map(node => StyleSheet.flatten(node.props.style))
      .filter(style => style?.flexShrink === 0 && style?.marginRight !== undefined);

    expect(items[0].marginBottom).toBe(2.5);
  });

  it('applies external style prop to root container', () => {
    const testRenderer = renderSpace({ style: { opacity: 0.5 } });
    const rootStyle = flattenStyle(getSpaceRoot(testRenderer).props.style);
    expect(rootStyle.opacity).toBe(0.5);
  });

  it('applies styles.item to each child item', () => {
    let testRenderer: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(
        <ThemeProvider
          config={{
            token: {
              paddingXXS: 3,
              paddingXS: 5,
              paddingSM: 7,
            },
          }}
        >
          <Space styles={{ item: { opacity: 0.3 } }}>
            <Text>A</Text>
            <Text>B</Text>
          </Space>
        </ThemeProvider>,
      );
    });
    const items = testRenderer!.root
      .findAllByType(View)
      .map(node => StyleSheet.flatten(node.props.style))
      .filter(style => style?.flexShrink === 0);

    expect(items[0].opacity).toBe(0.3);
  });

  it('filters out null and undefined children', () => {
    const testRenderer = renderSpace();
    const textNodes = testRenderer.root.findAllByType(Text);
    expect(textNodes).toHaveLength(3);
    expect(textNodes.map(n => n.props.children)).toEqual(['Income', 'Expense', 'Balance']);
  });
});
