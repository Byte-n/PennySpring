import React from 'react';
import { View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { List, ListItem } from '../src/List';
import { Text } from '../src/Text';
function renderList(element: React.ReactElement) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<>{element}</>);
  });
  return testRenderer!;
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

  it('wraps title string in Text component when passed as title prop', () => {
    const testRenderer = renderList(<ListItem title="Checking" />);
    const textNodes = testRenderer.root.findAllByType(Text);
    const titleText = textNodes.find(node => node.props.children === 'Checking');
    expect(titleText).toBeDefined();
  });

  it('wraps description string in Text component when passed as description prop', () => {
    const testRenderer = renderList(<ListItem description="Main account" />);
    const textNodes = testRenderer.root.findAllByType(Text);
    const descText = textNodes.find(node => node.props.children === 'Main account');
    expect(descText).toBeDefined();
  });

  it('uses Row component for horizontal layout', () => {
    const testRenderer = renderList(<ListItem title="Checking" />);
    const treeString = JSON.stringify(testRenderer.toJSON());
    expect(treeString).toContain('"testID":"row"');
  });

  it('applies external style after state styles for selected items', () => {
    const testRenderer = renderList(
      <ListItem title="Checking" selected style={{ opacity: 0.5 }} />,
    );
    const root = testRenderer.root.findAll(
      node => Array.isArray(node.props.style) && node.props.style.length >= 4,
    )[0];
    const styles = root.props.style as unknown[];
    const lastStyle = styles[styles.length - 1];
    expect(lastStyle).toEqual({ opacity: 0.5 });
  });

  it('applies external style after state styles for pressed items', () => {
    const onPress = jest.fn();
    const testRenderer = renderList(
      <ListItem title="Checking" onPress={onPress} style={{ opacity: 0.5 }} />,
    );
    const pressable = testRenderer.root.findAll(node =>
      typeof node.props.onPress === 'function' && typeof node.props.style === 'function',
    )[0];
    const resolvedStyle = pressable.props.style({ pressed: true });
    const lastStyle = resolvedStyle[resolvedStyle.length - 1];
    expect(lastStyle).toEqual({ opacity: 0.5 });
  });
});
