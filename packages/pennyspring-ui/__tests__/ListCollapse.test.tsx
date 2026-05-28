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
    const onOpenChange = jest.fn();
    const onHeaderPress = jest.fn();
    const testRenderer = renderListCollapse({
      onOpenChange,
      onHeaderPress,
      title: 'Budget',
      children: <Text>Budget details</Text>
    });
    expect(treeText(testRenderer)).not.toContain('Budget details');
    pressHeader(testRenderer);
    expect(onHeaderPress).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(treeText(testRenderer)).toContain('Budget details');
  });
  it('uses controlled open value without mutating internally', () => {
    const onOpenChange = jest.fn();
    const testRenderer = renderListCollapse({
      open: false,
      onOpenChange,
      title: 'Budget',
      children: <Text>Budget details</Text>
    });
    pressHeader(testRenderer);
    expect(onOpenChange).toHaveBeenCalledWith(true);
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
      const onOpenChange = jest.fn();
      const testRenderer = renderListCollapse({
        ...state,
        onOpenChange,
        title: 'Budget',
        children: <Text>Budget details</Text>
      });
      pressHeader(testRenderer);
      expect(onOpenChange).not.toHaveBeenCalled();
      expect(treeText(testRenderer)).not.toContain('Budget details');
    });
  });
  it('opens uncontrolled content with defaultOpen', () => {
    const testRenderer = renderListCollapse({
      defaultOpen: true,
      title: 'Budget',
      children: <Text>Budget details</Text>
    });
    expect(treeText(testRenderer)).toContain('Budget details');
  });
  it('renders summaryText via Text component', () => {
    const testRenderer = renderListCollapse({
      title: 'Budget',
      summaryText: '2 items',
    });
    expect(treeText(testRenderer)).toContain('2 items');
  });
  it('renders summary ReactNode directly', () => {
    const testRenderer = renderListCollapse({
      title: 'Budget',
      summary: <Text color="description">Custom node</Text>,
    });
    expect(treeText(testRenderer)).toContain('Custom node');
  });
  it('hides summary slot when summary is null', () => {
    const testRenderer = renderListCollapse({
      title: 'Budget',
      summary: null,
    });
    const json = treeText(testRenderer);
    expect(json).not.toContain('summary');
  });
});
