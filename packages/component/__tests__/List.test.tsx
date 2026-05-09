import React from 'react';
import { View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { defaultSeedToken } from '@pennyspring/theme';
import { derivative } from '@pennyspring/theme/src/algorithms/derivative';
import { formatToken } from '@pennyspring/theme/src/algorithms/formatToken';
import { List } from '../src/List';

const token = formatToken(derivative(defaultSeedToken, false));

const SMALL_ITEM_MIN_HEIGHT = token.controlHeightSM;
const LARGE_ITEM_MIN_HEIGHT = token.controlHeightLG;
const SMALL_ITEM_PADDING = token.paddingXS;
const LARGE_ITEM_PADDING = token.paddingMD;
const FULL_DIVIDER_LEFT = 0;
const INSET_DIVIDER_LEFT = token.paddingMD + token.marginSM;

function renderList(element: React.ReactElement) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <ThemeProvider>
        {element}
      </ThemeProvider>,
    );
  });

  return testRenderer!;
}

function flattenStyle(style: unknown) {
  const styles = Array.isArray(style) ? style : [style];

  return Object.assign({}, ...styles);
}

function findNodesWithStyle(
  testRenderer: renderer.ReactTestRenderer,
  markerStyle: Record<string, unknown>,
) {
  return testRenderer.root.findAll((node) => {
    const style = node.props.style;

    return node.type === View && Array.isArray(style) && style.includes(markerStyle);
  });
}

describe('List', () => {
  it('renders header and footer around children', () => {
    const testRenderer = renderList(
      <List
        header={<View testID="header">Header</View>}
        footer={<View testID="footer">Footer</View>}
      >
        <View testID="content">Content</View>
      </List>,
    );
    const treeString = JSON.stringify(testRenderer.toJSON());

    expect(treeString.indexOf('Header')).toBeLessThan(treeString.indexOf('Content'));
    expect(treeString.indexOf('Content')).toBeLessThan(treeString.indexOf('Footer'));
  });

  it('renders empty content when children are empty', () => {
    const testRenderer = renderList(
      <List empty={<View testID="empty">Nothing yet</View>}>{null}</List>,
    );
    const treeString = JSON.stringify(testRenderer.toJSON());

    expect(treeString).toContain('Nothing yet');
  });

  it('does not render empty content when children exist', () => {
    const testRenderer = renderList(
      <List empty={<View testID="empty">Nothing yet</View>}>
        <View testID="content">Account</View>
      </List>,
    );
    const treeString = JSON.stringify(testRenderer.toJSON());

    expect(treeString).toContain('Account');
    expect(treeString).not.toContain('Nothing yet');
  });

  it('renders loading without replacing empty content', () => {
    const testRenderer = renderList(
      <List
        loading
        empty={<View testID="empty">Nothing yet</View>}
      />,
    );
    const treeString = JSON.stringify(testRenderer.toJSON());

    expect(treeString).toContain('Loading');
    expect(treeString).toContain('Nothing yet');
  });

  it('applies List root and region styles after token styles', () => {
    const rootStyle = { flex: 1 };
    const headerStyle = { opacity: 0.91 };
    const footerStyle = { opacity: 0.92 };
    const emptyStyle = { opacity: 0.93 };
    const loadingStyle = { opacity: 0.94 };
    const testRenderer = renderList(
      <List
        loading
        style={rootStyle}
        styles={{
          empty: emptyStyle,
          footer: footerStyle,
          header: headerStyle,
          loading: loadingStyle,
        }}
        header={<View>Header</View>}
        footer={<View>Footer</View>}
        empty={<View>Nothing yet</View>}
      />,
    );
    const root = testRenderer.root.findByType(View);

    expect(root.props.style).toContain(rootStyle);
    expect(findNodesWithStyle(testRenderer, headerStyle)).toHaveLength(1);
    expect(findNodesWithStyle(testRenderer, footerStyle)).toHaveLength(1);
    expect(findNodesWithStyle(testRenderer, emptyStyle)).toHaveLength(1);
    expect(findNodesWithStyle(testRenderer, loadingStyle)).toHaveLength(1);
    expect(flattenStyle(findNodesWithStyle(testRenderer, emptyStyle)[0].props.style).opacity).toBe(0.93);
  });

  it('renders List.Item standard slots in order', () => {
    const testRenderer = renderList(
      <List.Item
        left={<View>Icon</View>}
        title="Checking"
        description="Main account"
        right={<View>Balance</View>}
      />,
    );
    const treeString = JSON.stringify(testRenderer.toJSON());

    expect(treeString.indexOf('Icon')).toBeLessThan(treeString.indexOf('Checking'));
    expect(treeString.indexOf('Checking')).toBeLessThan(treeString.indexOf('Main account'));
    expect(treeString.indexOf('Main account')).toBeLessThan(treeString.indexOf('Balance'));
  });

  it('renders List.Item children instead of default title and description', () => {
    const testRenderer = renderList(
      <List.Item title="Checking" description="Main account">
        <View>Custom body</View>
      </List.Item>,
    );
    const treeString = JSON.stringify(testRenderer.toJSON());

    expect(treeString).toContain('Custom body');
    expect(treeString).not.toContain('Checking');
    expect(treeString).not.toContain('Main account');
  });

  it('uses button semantics and calls onPress when List.Item is interactive', () => {
    const onPress = jest.fn();
    const testRenderer = renderList(<List.Item title="Checking" onPress={onPress} />);
    const button = testRenderer.root.find(
      (node) => node.props.accessibilityRole === 'button',
    );

    act(() => {
      button.props.onPress({} as never);
    });

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not expose button semantics when List.Item is display only', () => {
    const testRenderer = renderList(<List.Item title="Checking" />);

    expect(
      testRenderer.root.findAll((node) => node.props.accessibilityRole === 'button'),
    ).toHaveLength(0);
  });

  it('does not call onPress when List.Item is disabled', () => {
    const onPress = jest.fn();
    const testRenderer = renderList(
      <List.Item title="Checking" onPress={onPress} disabled />,
    );

    expect(onPress).not.toHaveBeenCalled();
    expect(
      testRenderer.root.findAll(
        (node) => node.props.accessibilityState?.disabled === true,
      ),
    ).not.toHaveLength(0);
  });

  it('exposes selected state and renders a selected marker', () => {
    const testRenderer = renderList(<List.Item title="Checking" selected />);
    const treeString = JSON.stringify(testRenderer.toJSON());

    expect(
      testRenderer.root.findAll(
        (node) => node.props.accessibilityState?.selected === true,
      ),
    ).not.toHaveLength(0);
    expect(treeString).toContain('selected-marker');
  });

  it('inherits List divider and allows List.Item divider override', () => {
    const dividerStyle = { opacity: 0.82 };
    const inheritedRenderer = renderList(
      <List divider="full">
        <List.Item title="Checking" styles={{ divider: dividerStyle }} />
      </List>,
    );
    const overrideRenderer = renderList(
      <List divider="full">
        <List.Item title="Checking" divider="none" styles={{ divider: dividerStyle }} />
      </List>,
    );

    expect(findNodesWithStyle(inheritedRenderer, dividerStyle)).toHaveLength(1);
    expect(flattenStyle(findNodesWithStyle(inheritedRenderer, dividerStyle)[0].props.style).left).toBe(FULL_DIVIDER_LEFT);
    expect(findNodesWithStyle(overrideRenderer, dividerStyle)).toHaveLength(0);
  });

  it('uses inset divider by default', () => {
    const dividerStyle = { opacity: 0.72 };
    const testRenderer = renderList(
      <List.Item title="Checking" styles={{ divider: dividerStyle }} />,
    );
    const divider = findNodesWithStyle(testRenderer, dividerStyle)[0];

    expect(flattenStyle(divider.props.style).left).toBe(INSET_DIVIDER_LEFT);
  });

  it('inherits List size and allows List.Item size override', () => {
    const largeRenderer = renderList(
      <List size="large">
        <List.Item title="Checking" />
      </List>,
    );
    const smallRenderer = renderList(
      <List size="large">
        <List.Item title="Checking" size="small" />
      </List>,
    );
    const largeItem = largeRenderer.root.findAllByType(View).find((node) => {
      return flattenStyle(node.props.style).minHeight === LARGE_ITEM_MIN_HEIGHT;
    });
    const smallItem = smallRenderer.root.findAllByType(View).find((node) => {
      return flattenStyle(node.props.style).minHeight === SMALL_ITEM_MIN_HEIGHT;
    });

    expect(largeItem).toBeDefined();
    expect(flattenStyle(largeItem?.props.style).paddingVertical).toBe(LARGE_ITEM_PADDING);
    expect(smallItem).toBeDefined();
    expect(flattenStyle(smallItem?.props.style).paddingVertical).toBe(SMALL_ITEM_PADDING);
  });

  it('applies List.Item root and slot styles after token styles', () => {
    const rootStyle = { flex: 1 };
    const leftStyle = { opacity: 0.61 };
    const contentStyle = { opacity: 0.62 };
    const rightStyle = { opacity: 0.63 };
    const titleStyle = { opacity: 0.64 };
    const descriptionStyle = { opacity: 0.65 };
    const testRenderer = renderList(
      <List.Item
        disabled
        selected
        left={<View>Icon</View>}
        right={<View>Balance</View>}
        title="Checking"
        description="Main account"
        style={rootStyle}
        styles={{
          content: contentStyle,
          description: descriptionStyle,
          left: leftStyle,
          right: rightStyle,
          title: titleStyle,
        }}
      />,
    );
    const root = testRenderer.root.findAllByType(View).find((node) => {
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
