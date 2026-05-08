import React from 'react';
import { View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { Text } from '../src/Text';
import { ListCollapse } from '../src/ListCollapse';

function renderListCollapse(props: React.ComponentProps<typeof ListCollapse>) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <ThemeProvider>
        <ListCollapse {...props} />
      </ThemeProvider>,
    );
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
  return testRenderer.root.find(
    (node) => node.props.accessibilityRole === 'button',
  );
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

describe('ListCollapse', () => {
  it('toggles uncontrolled content and reports changes from the header', () => {
    const onExpandedChange = jest.fn();
    const onHeaderPress = jest.fn();
    const testRenderer = renderListCollapse({
      onExpandedChange,
      onHeaderPress,
      title: 'Budget',
      children: <Text>Budget details</Text>,
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
      children: <Text>Budget details</Text>,
    });

    pressHeader(testRenderer);

    expect(onExpandedChange).toHaveBeenCalledWith(true);
    expect(treeText(testRenderer)).not.toContain('Budget details');
  });

  it('blocks toggling when disabled, readonly, or loading', () => {
    const states = [
      { disabled: true },
      { readonly: true },
      { loading: true },
    ];

    states.forEach((state) => {
      const onExpandedChange = jest.fn();
      const testRenderer = renderListCollapse({
        ...state,
        onExpandedChange,
        title: 'Budget',
        children: <Text>Budget details</Text>,
      });

      pressHeader(testRenderer);

      expect(onExpandedChange).not.toHaveBeenCalled();
      expect(treeText(testRenderer)).not.toContain('Budget details');
    });
  });

  it('applies slot styles and accessibility state', () => {
    const headerStyle = { opacity: 0.81 };
    const contentStyle = { opacity: 0.82 };
    const testRenderer = renderListCollapse({
      defaultExpanded: true,
      disabled: true,
      title: 'Budget',
      children: <Text>Budget details</Text>,
      styles: {
        content: contentStyle,
        header: headerStyle,
      },
    });
    const header = findHeader(testRenderer);

    expect(header.props.accessibilityRole).toBe('button');
    expect(header.props.accessibilityState.expanded).toBe(true);
    expect(header.props.accessibilityState.disabled).toBe(true);
    expect(findNodesWithStyle(testRenderer, headerStyle)).toHaveLength(1);
    expect(findNodesWithStyle(testRenderer, contentStyle)).toHaveLength(1);
  });
});
