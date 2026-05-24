import React from 'react';
import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
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
});
