import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { Column } from '../src/Column';
import { Row } from '../src/Row';

const LAYOUT_GAP_TOKENS = { sizeXS: 3, paddingSM: 5, padding: 7 };

function renderWithTheme(
  element: React.ReactElement,
  token: Record<string, number>,
) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(
      <ThemeProvider config={{ token }}>{element}</ThemeProvider>,
    );
  });
  return testRenderer!;
}

describe('Row and Column', () => {
  it.each([
    ['small', 3],
    ['normal', 5],
    ['large', 7],
  ] as const)('maps Row %s gap to layout gap token', (gap, expectedGap) => {
    const testRenderer = renderWithTheme(
      <Row gap={gap}>
        <Text>Income</Text>
        <Text>Expense</Text>
      </Row>,
      LAYOUT_GAP_TOKENS,
    );
    const row = testRenderer.root.findByProps({
      testID: 'row',
    });
    const style = StyleSheet.flatten(row.props.style);

    expect(style.gap).toBe(expectedGap);
  });

  it.each([
    ['small', 3],
    ['normal', 5],
    ['large', 7],
  ] as const)('maps Column %s gap to layout gap token', (gap, expectedGap) => {
    const testRenderer = renderWithTheme(
      <Column gap={gap}>
        <Text>Income</Text>
        <Text>Expense</Text>
      </Column>,
      LAYOUT_GAP_TOKENS,
    );
    const column = testRenderer.root.findByProps({
      testID: 'column',
    });
    const style = StyleSheet.flatten(column.props.style);

    expect(style.gap).toBe(expectedGap);
  });

  it('uses zero gap by default for Column', () => {
    const testRenderer = renderWithTheme(
      <Column>
        <Text>Income</Text>
        <Text>Expense</Text>
      </Column>,
      LAYOUT_GAP_TOKENS,
    );
    const column = testRenderer.root.findByProps({
      testID: 'column',
    });
    const style = StyleSheet.flatten(column.props.style);

    expect(style.gap).toBe(0);
  });

  it('keeps numeric gap values for explicit layout overrides', () => {
    const testRenderer = renderWithTheme(
      <Row gap={9}>
        <View />
      </Row>,
      LAYOUT_GAP_TOKENS,
    );
    const row = testRenderer.root.findByProps({
      testID: 'row',
    });
    const style = StyleSheet.flatten(row.props.style);

    expect(style.gap).toBe(9);
  });

  it('keeps numeric gap values for Column layout overrides', () => {
    const testRenderer = renderWithTheme(
      <Column gap={9}>
        <View />
      </Column>,
      LAYOUT_GAP_TOKENS,
    );
    const column = testRenderer.root.findByProps({
      testID: 'column',
    });
    const style = StyleSheet.flatten(column.props.style);

    expect(style.gap).toBe(9);
  });
});
