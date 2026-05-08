import React from 'react';
import { View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { Text } from '../src/Text';
import { List } from '../src/List';
import { ListGroup } from '../src/ListGroup';

function renderListGroup(props: React.ComponentProps<typeof ListGroup>) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <ThemeProvider>
        <ListGroup {...props} />
      </ThemeProvider>,
    );
  });

  return testRenderer!;
}

function treeText(testRenderer: renderer.ReactTestRenderer) {
  return JSON.stringify(testRenderer.toJSON());
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

describe('ListGroup', () => {
  it('renders title, summary, children, and footer in group order', () => {
    const testRenderer = renderListGroup({
      footer: <Text>Month total</Text>,
      summary: <Text>3 records</Text>,
      title: 'May',
      children: <List.Item title="Coffee" />,
    });
    const text = treeText(testRenderer);

    expect(text.indexOf('May')).toBeLessThan(text.indexOf('3 records'));
    expect(text.indexOf('3 records')).toBeLessThan(text.indexOf('Coffee'));
    expect(text.indexOf('Coffee')).toBeLessThan(text.indexOf('Month total'));
  });

  it('renders empty content by default when children are empty', () => {
    const testRenderer = renderListGroup({
      empty: <Text>No records</Text>,
      title: 'Today',
    });
    const text = treeText(testRenderer);

    expect(text).toContain('Today');
    expect(text).toContain('No records');
  });

  it('hides the whole group when empty and hideWhenEmpty is true', () => {
    const testRenderer = renderListGroup({
      empty: <Text>No records</Text>,
      hideWhenEmpty: true,
      title: 'Today',
    });

    expect(testRenderer.toJSON()).toBeNull();
  });

  it('applies stable slot styles', () => {
    const headerStyle = { opacity: 0.91 };
    const listStyle = { opacity: 0.92 };
    const footerStyle = { opacity: 0.93 };
    const emptyStyle = { opacity: 0.94 };
    const testRenderer = renderListGroup({
      empty: <Text>No records</Text>,
      footer: <Text>Footer</Text>,
      title: 'Today',
      styles: {
        empty: emptyStyle,
        footer: footerStyle,
        header: headerStyle,
        list: listStyle,
      },
    });

    expect(findNodesWithStyle(testRenderer, headerStyle)).toHaveLength(1);
    expect(findNodesWithStyle(testRenderer, listStyle)).toHaveLength(0);
    expect(findNodesWithStyle(testRenderer, footerStyle)).toHaveLength(1);
    expect(findNodesWithStyle(testRenderer, emptyStyle)).toHaveLength(1);
  });
});
