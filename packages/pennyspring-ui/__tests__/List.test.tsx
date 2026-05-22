import React from 'react';
import { View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { List, ListItem } from '../src/List';
function renderList(element: React.ReactElement) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<>{element}</>);
  });
  return testRenderer!;
}
function flattenStyle(style: unknown) {
  const styles = Array.isArray(style) ? style : [style];
  return Object.assign({}, ...styles);
}
function findNodesWithStyle(testRenderer: renderer.ReactTestRenderer, markerStyle: Record<string, unknown>) {
  return testRenderer.root.findAll(node => {
    const style = node.props.style;
    return node.type === View && Array.isArray(style) && style.includes(markerStyle);
  });
}
describe('List', () => {
  it('renders header and footer around children', () => {
    const testRenderer = renderList(<List header={<View testID="header">Header</View>} footer={<View testID="footer">Footer</View>}>
        <View testID="content">Content</View>
      </List>);
    const treeString = JSON.stringify(testRenderer.toJSON());
    expect(treeString.indexOf('Header')).toBeLessThan(treeString.indexOf('Content'));
    expect(treeString.indexOf('Content')).toBeLessThan(treeString.indexOf('Footer'));
  });
  it('renders empty content when children are empty', () => {
    const testRenderer = renderList(<List empty={<View testID="empty">Nothing yet</View>}>{null}</List>);
    const treeString = JSON.stringify(testRenderer.toJSON());
    expect(treeString).toContain('Nothing yet');
  });
  it('does not render empty content when children exist', () => {
    const testRenderer = renderList(<List empty={<View testID="empty">Nothing yet</View>}>
        <View testID="content">Account</View>
      </List>);
    const treeString = JSON.stringify(testRenderer.toJSON());
    expect(treeString).toContain('Account');
    expect(treeString).not.toContain('Nothing yet');
  });
  it('renders loading without replacing empty content', () => {
    const testRenderer = renderList(
      <List loading loadingText="Loading" empty={<View testID="empty">Nothing yet</View>} />,
    );
    const treeString = JSON.stringify(testRenderer.toJSON());
    expect(treeString).toContain('Loading');
    expect(treeString).toContain('Nothing yet');
  });
  it('applies List root and region styles after token styles', () => {
    const rootStyle = {
      flex: 1
    };
    const headerStyle = {
      opacity: 0.91
    };
    const footerStyle = {
      opacity: 0.92
    };
    const emptyStyle = {
      opacity: 0.93
    };
    const loadingStyle = {
      opacity: 0.94
    };
    const testRenderer = renderList(<List loading loadingText="Loading" style={rootStyle} styles={{
      empty: emptyStyle,
      footer: footerStyle,
      header: headerStyle,
      loading: loadingStyle
    }} header={<View>Header</View>} footer={<View>Footer</View>} empty={<View>Nothing yet</View>} />);
    const root = testRenderer.root.findByType(View);
    expect(root.props.style).toContain(rootStyle);
    expect(findNodesWithStyle(testRenderer, headerStyle)).toHaveLength(1);
    expect(findNodesWithStyle(testRenderer, footerStyle)).toHaveLength(1);
    expect(findNodesWithStyle(testRenderer, emptyStyle)).toHaveLength(1);
    expect(findNodesWithStyle(testRenderer, loadingStyle)).toHaveLength(1);
    expect(flattenStyle(findNodesWithStyle(testRenderer, emptyStyle)[0].props.style).opacity).toBe(0.93);
  });
  it('renders ListItem standard slots in order', () => {
    const testRenderer = renderList(<ListItem left={<View>Icon</View>} title="Checking" description="Main account" right={<View>Balance</View>} />);
    const treeString = JSON.stringify(testRenderer.toJSON());
    expect(treeString.indexOf('Icon')).toBeLessThan(treeString.indexOf('Checking'));
    expect(treeString.indexOf('Checking')).toBeLessThan(treeString.indexOf('Main account'));
    expect(treeString.indexOf('Main account')).toBeLessThan(treeString.indexOf('Balance'));
  });
  it('renders ListItem children instead of default title and description', () => {
    const testRenderer = renderList(<ListItem title="Checking" description="Main account">
        <View>Custom body</View>
      </ListItem>);
    const treeString = JSON.stringify(testRenderer.toJSON());
    expect(treeString).toContain('Custom body');
    expect(treeString).not.toContain('Checking');
    expect(treeString).not.toContain('Main account');
  });
  it('uses Pressable and calls onPress when ListItem is interactive', () => {
    const onPress = jest.fn();
    const testRenderer = renderList(<ListItem title="Checking" onPress={onPress} />);
    const button = testRenderer.root.findAll(node =>
      typeof node.props.onPress === 'function' && typeof node.props.style === 'function'
    )[0];
    act(() => {
      button.props.onPress({} as never);
    });
    expect(onPress).toHaveBeenCalledTimes(1);
  });
  it('does not use Pressable when ListItem is display only', () => {
    const testRenderer = renderList(<ListItem title="Checking" />);
    const pressables = testRenderer.root.findAll(node =>
      typeof node.props.onPress === 'function' && typeof node.props.style === 'function'
    );
    expect(pressables).toHaveLength(0);
  });
  it('does not call onPress when ListItem is disabled', () => {
    const onPress = jest.fn();
    const testRenderer = renderList(<ListItem title="Checking" onPress={onPress} disabled />);
    expect(onPress).not.toHaveBeenCalled();
    // When disabled, ListItem renders a View instead of a Pressable
    const pressables = testRenderer.root.findAll(node =>
      typeof node.props.onPress === 'function' && typeof node.props.style === 'function'
    );
    expect(pressables).toHaveLength(0);
  });
  it('renders a selected marker when selected', () => {
    const testRenderer = renderList(<ListItem title="Checking" selected />);
    const treeString = JSON.stringify(testRenderer.toJSON());
    expect(treeString).toContain('selected-marker');
  });
  it('inherits List divider and allows ListItem divider override', () => {
    const dividerStyle = {
      opacity: 0.82
    };
    const inheritedRenderer = renderList(<List divider="full">
        <ListItem title="Checking" styles={{
        divider: dividerStyle
      }} />
      </List>);
    const overrideRenderer = renderList(<List divider="full">
        <ListItem title="Checking" divider="none" styles={{
        divider: dividerStyle
      }} />
      </List>);
    expect(findNodesWithStyle(inheritedRenderer, dividerStyle)).toHaveLength(1);
    expect(flattenStyle(findNodesWithStyle(inheritedRenderer, dividerStyle)[0].props.style).left).toBe(0);
    expect(findNodesWithStyle(overrideRenderer, dividerStyle)).toHaveLength(0);
  });
  it('applies ListItem root and slot styles after token styles', () => {
    const rootStyle = {
      flex: 1
    };
    const leftStyle = {
      opacity: 0.61
    };
    const contentStyle = {
      opacity: 0.62
    };
    const rightStyle = {
      opacity: 0.63
    };
    const titleStyle = {
      opacity: 0.64
    };
    const descriptionStyle = {
      opacity: 0.65
    };
    const testRenderer = renderList(<ListItem disabled selected left={<View>Icon</View>} right={<View>Balance</View>} titleText="Checking" descriptionText="Main account" style={rootStyle} styles={{
      content: contentStyle,
      descriptionText: descriptionStyle,
      left: leftStyle,
      right: rightStyle,
      titleText: titleStyle
    }} />);
    const root = testRenderer.root.findAllByType(View).find(node => {
      const style = node.props.style;
      return Array.isArray(style) && style.includes(rootStyle);
    });
    expect(root?.props.style).toContain(rootStyle);
    expect(findNodesWithStyle(testRenderer, leftStyle)).toHaveLength(1);
    expect(findNodesWithStyle(testRenderer, contentStyle)).toHaveLength(1);
    expect(findNodesWithStyle(testRenderer, rightStyle)).toHaveLength(1);
    expect(JSON.stringify(testRenderer.toJSON())).toContain('Checking');
    expect(JSON.stringify(testRenderer.toJSON())).toContain('Main account');
  });
});
