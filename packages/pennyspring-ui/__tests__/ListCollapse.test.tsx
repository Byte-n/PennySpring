import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Text } from '../src/Text';
import { ListCollapse } from '../src/ListCollapse';
function renderListCollapse(props: React.ComponentProps<typeof ListCollapse>) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><ListCollapse {...props} /></>);
  });
  return testRenderer!;
}
function treeText(testRenderer: renderer.ReactTestRenderer) {
  return JSON.stringify(testRenderer.toJSON());
}
function pressHeader(testRenderer: renderer.ReactTestRenderer) {
  act(() => {
    findHeader(testRenderer).props.onPress({});
  });
}
function findHeader(testRenderer: renderer.ReactTestRenderer) {
  return testRenderer.root.findAll(node =>
    typeof node.props.onPress === 'function' && typeof node.props.style === 'function'
  )[0];
}
describe('ListCollapse', () => {
  it('toggles uncontrolled content and reports changes from the header', () => {
    const onExpandedChange = jest.fn();
    const onHeaderPress = jest.fn();
    const testRenderer = renderListCollapse({
      onExpandedChange,
      onHeaderPress,
      title: 'Budget',
      children: <Text>Budget details</Text>
    });
    expect(treeText(testRenderer)).not.toContain('Budget details');
    pressHeader(testRenderer);
    expect(onHeaderPress).toHaveBeenCalledTimes(1);
    expect(onExpandedChange).toHaveBeenCalledWith(true);
    expect(treeText(testRenderer)).toContain('Budget details');
  });
  it('uses controlled expanded value without mutating internally', () => {
    const onExpandedChange = jest.fn();
    const testRenderer = renderListCollapse({
      expanded: false,
      onExpandedChange,
      title: 'Budget',
      children: <Text>Budget details</Text>
    });
    pressHeader(testRenderer);
    expect(onExpandedChange).toHaveBeenCalledWith(true);
    expect(treeText(testRenderer)).not.toContain('Budget details');
  });
  it('blocks toggling when disabled, readonly, or loading', () => {
    const states = [{
      disabled: true
    }, {
      readonly: true
    }, {
      loading: true
    }];
    states.forEach(state => {
      const onExpandedChange = jest.fn();
      const testRenderer = renderListCollapse({
        ...state,
        onExpandedChange,
        title: 'Budget',
        children: <Text>Budget details</Text>
      });
      pressHeader(testRenderer);
      expect(onExpandedChange).not.toHaveBeenCalled();
      expect(treeText(testRenderer)).not.toContain('Budget details');
    });
  });
});
