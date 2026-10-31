import React from 'react';
import { StyleSheet, Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { Grid } from '../src/Grid';

function renderGrid(element: React.ReactElement) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<>{element}</>);
  });
  return testRenderer!;
}
describe('Grid', () => {
  it('renders pressable items only when onPress is provided', () => {
    const handlePress = jest.fn();
    const testRenderer = renderGrid(<Grid columns={2}>
        <Grid.Item onPress={handlePress}>
          <Text>Clickable</Text>
        </Grid.Item>
        <Grid.Item>
          <Text>Static</Text>
        </Grid.Item>
      </Grid>);
    const pressableNodes = testRenderer.root.findAll(node => {
      return node.props.testID === 'grid-item' && node.props.onPress !== undefined;
    });
    expect(pressableNodes).toHaveLength(1);
    act(() => {
      pressableNodes[0].props.onPress();
    });
    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it('uses zero layout gap by default', () => {
    const testRenderer = renderGrid(
      <ThemeProvider
        config={{
          token: {
            paddingSM: 5,
          },
        }}
      >
        <Grid columns={2}>
          <Grid.Item>
            <Text>Income</Text>
          </Grid.Item>
        </Grid>
      </ThemeProvider>,
    );
    const item = testRenderer.root.findByProps({
      testID: 'grid-item',
    });
    const itemStyle = StyleSheet.flatten(item.props.style);

    expect(itemStyle.paddingHorizontal).toBe(0);
    expect(itemStyle.paddingVertical).toBeUndefined();
    const rootStyle = StyleSheet.flatten(
      testRenderer.root.findByProps({ testID: 'grid' }).props.style,
    );
    expect(rootStyle.marginHorizontal).toBe(0);
  });

  it.each([
    ['small', 3],
    ['normal', 5],
    ['large', 7],
  ] as const)('maps %s gap to layout gap token', (gap, expectedGap) => {
    const testRenderer = renderGrid(
      <ThemeProvider
        config={{
          token: {
            sizeXS: 3,
            paddingSM: 5,
            padding: 7,
          },
        }}
      >
        <Grid columns={2} gap={gap}>
          <Grid.Item>
            <Text>Income</Text>
          </Grid.Item>
        </Grid>
      </ThemeProvider>,
    );
    const item = testRenderer.root.findByProps({
      testID: 'grid-item',
    });
    const itemStyle = StyleSheet.flatten(item.props.style);

    expect(itemStyle.paddingHorizontal).toBe(expectedGap / 2);
    expect(itemStyle.paddingVertical).toBeUndefined();
  });
});
