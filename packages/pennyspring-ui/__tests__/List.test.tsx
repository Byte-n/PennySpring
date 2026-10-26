import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { FlatList } from 'react-native';
import { List } from '../src/List';
import { Text } from '../src/Text';

function renderList(element: React.ReactElement) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => { testRenderer = renderer.create(element); });
  return testRenderer!;
}

describe('List', () => {
  it('renders data through a FlatList and forwards row rendering', () => {
    const testRenderer = renderList(<List data={['one', 'two']} renderItem={({ item }) => <Text>{item}</Text>} />);
    const flatList = testRenderer.root.findByType(FlatList);
    expect(flatList.props.data).toEqual(['one', 'two']);
    const renderedRow = flatList.props.renderItem({ item: 'one', index: 0, separators: {} });
    expect(renderedRow.props.children.props.children).toBe('one');
  });

  it('renders empty content when there are no rows', () => {
    const testRenderer = renderList(<List data={[]} empty={<Text>Nothing here</Text>} />);
    const flatList = testRenderer.root.findByType(FlatList);
    expect(flatList.props.ListEmptyComponent.props.children.props.children).toBe('Nothing here');
  });

  it('renders loading content in the list footer', () => {
    const testRenderer = renderList(<List data={[]} loading loadingText="Loading more" />);
    expect(testRenderer.root.findAllByType(Text).some(node => node.props.children === 'Loading more')).toBe(true);
  });

  it('toggles a collapsible group and reports the new state', () => {
    const onOpenChange = jest.fn();
    const testRenderer = renderList(<List collapsible titleText="Group" open={false} onOpenChange={onOpenChange}><Text>Nested row</Text></List>);
    const header = testRenderer.root.findAll(node => typeof node.props.onPress === 'function').at(-1);
    act(() => header?.props.onPress());
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});
