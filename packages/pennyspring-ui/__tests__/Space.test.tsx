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
});
