import React from 'react';
import { StyleSheet, Text as RNText, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { Card } from '../src/Card';
import { Text } from '../src/Text';
function renderCard(props: Partial<React.ComponentProps<typeof Card>> = {}) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><Card {...props} /></>);
  });
  return testRenderer!;
}
function getPressableRoot(testRenderer: renderer.ReactTestRenderer) {
  return testRenderer.root.findAll(node => {
    return typeof node.props.onPress === 'function' &&
      typeof node.props.style === 'function' &&
      node.children.length > 0;
  })[0];
}
function getRootView(testRenderer: renderer.ReactTestRenderer) {
  return testRenderer.root.findAllByType(View)[0];
}
describe('Card', () => {
  it('renders header body and footer content in order', () => {
    const testRenderer = renderCard({
      titleText: 'Balance',
      extra: <RNText>More</RNText>,
      footer: <RNText>Footer action</RNText>,
      children: <RNText>Body content</RNText>
    });
    const treeString = JSON.stringify(testRenderer.toJSON());
    expect(treeString.indexOf('Balance')).toBeLessThan(treeString.indexOf('More'));
    expect(treeString.indexOf('More')).toBeLessThan(treeString.indexOf('Body content'));
    expect(treeString.indexOf('Body content')).toBeLessThan(treeString.indexOf('Footer action'));
  });
  it('uses Pressable root and invokes onPress when interactive', () => {
    const onPress = jest.fn();
    const testRenderer = renderCard({
      onPress,
      children: <RNText>Open account</RNText>
    });
    const root = getPressableRoot(testRenderer);
    act(() => {
      root.props.onPress({} as never);
    });
    expect(onPress).toHaveBeenCalledTimes(1);
  });
  it('blocks disabled press from invoking onPress', () => {
    const onPress = jest.fn();
    const testRenderer = renderCard({
      disabled: true,
      onPress,
      children: <RNText>Disabled account</RNText>
    });
    const root = getPressableRoot(testRenderer);
    act(() => {
      root.props.onPress({} as never);
    });
    expect(onPress).not.toHaveBeenCalled();
  });
  it('blocks loading press from invoking onPress', () => {
    const onPress = jest.fn();
    const testRenderer = renderCard({
      loading: true,
      onPress,
      children: <RNText>Loading account</RNText>
    });
    const root = getPressableRoot(testRenderer);
    act(() => {
      root.props.onPress({} as never);
    });
    expect(onPress).not.toHaveBeenCalled();
  });
  it('replaces children with loadingNode while loading', () => {
    const testRenderer = renderCard({
      loading: true,
      loadingNode: <RNText>Loading summary</RNText>,
      children: <RNText>Loaded summary</RNText>
    });
    const treeString = JSON.stringify(testRenderer.toJSON());
    expect(treeString).toContain('Loading summary');
    expect(treeString).not.toContain('Loaded summary');
  });
  it('keeps children when loadingNode is absent', () => {
    const testRenderer = renderCard({
      loading: true,
      children: <RNText>Existing summary</RNText>
    });
    const treeString = JSON.stringify(testRenderer.toJSON());
    expect(treeString).toContain('Existing summary');
  });
  it.each(['plain', 'elevated', 'summary'] as const)(
    'renders %s variant without borders',
    (variant) => {
      const testRenderer = renderCard({
        variant,
        children: <RNText>Body content</RNText>,
      });
      const rootStyle = StyleSheet.flatten(getRootView(testRenderer).props.style);

      expect(rootStyle.borderWidth).toBeUndefined();
      expect(rootStyle.borderColor).toBeUndefined();
    }
  );

  it('keeps summary on the plain surface without shadow or primary border', () => {
    let testRenderer: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(
        <ThemeProvider config={{
          token: {
            colorBgContainer: 'summaryContainerToken',
            colorPrimaryBorder: 'summaryBorderToken',
            boxShadowTertiary: {
              shadowColor: 'summaryShadowToken',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.02,
              shadowRadius: 4,
              elevation: 2,
            },
          },
        }}
        >
          <Card variant="summary">
            <RNText>Summary content</RNText>
          </Card>
        </ThemeProvider>
      );
    });
    const rootStyle = StyleSheet.flatten(getRootView(testRenderer!).props.style);

    expect(rootStyle.backgroundColor).toBe('summaryContainerToken');
    expect(rootStyle.borderColor).toBeUndefined();
    expect(rootStyle.shadowColor).toBeUndefined();
  });

  it.each([
    ['small', 11, 5],
    ['normal', 13, 7],
    ['large', 17, 7],
  ] as const)('maps %s size to container padding and layout gap tokens', (size, expectedPadding, expectedGap) => {
    let testRenderer: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(
        <ThemeProvider
          config={{
            token: {
              marginXXS: 3,
              marginXS: 5,
              marginSM: 7,
              paddingSM: 11,
              padding: 13,
              paddingMD: 17,
            },
          }}
        >
          <Card
            size={size}
            titleText="Balance"
            footer={<RNText>Footer action</RNText>}
          >
            <RNText>Body content</RNText>
          </Card>
        </ThemeProvider>,
      );
    });
    const views = testRenderer!.root.findAllByType(View);
    const rootStyle = StyleSheet.flatten(views[0].props.style);
    const headerRow = testRenderer!.root.findAllByProps({ testID: 'row' })[0];
    const headerStyle = StyleSheet.flatten(headerRow.props.style);
    const footerView = views.find(node => {
      const flattened = StyleSheet.flatten(node.props.style);
      return Boolean(flattened?.borderTopWidth);
    });
    const footerStyle = StyleSheet.flatten(footerView?.props.style);

    expect(rootStyle.padding).toBe(expectedPadding);
    expect(headerStyle.gap).toBe(expectedGap);
    expect(footerStyle.paddingTop).toBe(expectedGap);
    expect(footerStyle.marginHorizontal).toBe(-expectedPadding);
    expect(footerStyle.paddingHorizontal).toBe(expectedPadding);
  });

  it('keeps the card surface and dims only the title when disabled', () => {
    const testRenderer = renderCard({
      disabled: true,
      onPress: jest.fn(),
      titleText: 'Balance',
      children: <RNText>Body content</RNText>,
    });
    const rootStyle = StyleSheet.flatten(getRootView(testRenderer).props.style);
    const titleNode = testRenderer.root
      .findAllByType(Text)
      .find(node => node.props.children === 'Balance');

    expect(rootStyle.opacity).toBeUndefined();
    expect(titleNode?.props.color).toBe('tertiary');
  });

  it('dims the body to 45% while loading without replacing children', () => {
    const testRenderer = renderCard({
      loading: true,
      children: <RNText>Existing summary</RNText>,
    });
    const dimmed = testRenderer.root.findAllByType(View).filter(node => {
      return StyleSheet.flatten(node.props.style)?.opacity === 0.45;
    });

    expect(dimmed.length).toBe(1);
    expect(JSON.stringify(testRenderer.toJSON())).toContain('Existing summary');
  });

  it('renders extra and footer as small secondary text', () => {
    const testRenderer = renderCard({
      titleText: 'Balance',
      extra: 'More',
      footer: 'Footer action',
      children: <RNText>Body content</RNText>,
    });
    const textNodes = testRenderer.root.findAllByType(Text);
    const extraNode = textNodes.find(node => node.props.children === 'More');
    const footerNode = textNodes.find(node => node.props.children === 'Footer action');

    expect(extraNode?.props.size).toBe('sm');
    expect(extraNode?.props.color).toBe('tertiary');
    expect(footerNode?.props.size).toBe('sm');
    expect(footerNode?.props.color).toBe('secondary');
  });

  it('does not render header when title and extra are null', () => {
    const testRenderer = renderCard({
      title: null,
      extra: null,
      children: <RNText>Body content</RNText>,
    });
    const treeString = JSON.stringify(testRenderer.toJSON());
    expect(treeString).not.toContain('marginBottom');
    expect(treeString).not.toContain('Body content","type":"View"},{"children":null');
  });

  it('does not render footer when footer is null', () => {
    const testRenderer = renderCard({
      footer: null,
      children: <RNText>Body content</RNText>,
    });
    const treeString = JSON.stringify(testRenderer.toJSON());
    expect(treeString).not.toContain('borderTopWidth');
    expect(treeString).not.toContain('paddingTop');
  });

  it('uses layout primitives for card structure instead of plain view layout containers', () => {
    // Arrange
    const testRenderer = renderCard({
      titleText: 'Balance',
      extra: <RNText>More</RNText>,
      footer: <RNText>Footer action</RNText>,
      children: <RNText>Body content</RNText>,
    });

    // Act
    const rowNodes = testRenderer.root.findAllByProps({ testID: 'row' });
    const columnNodes = testRenderer.root.findAllByProps({ testID: 'column' });

    // Assert
    expect(rowNodes.length).toBeGreaterThan(0);
    expect(columnNodes.length).toBeGreaterThan(0);
  });

  it.each([
    ['small', 'sm'],
    ['normal', 'md'],
    ['large', 'md'],
  ] as const)(
    'maps %s titleText to semantic Text props',
    (size, expectedTextSize) => {
      // Arrange
      const testRenderer = renderCard({
        size,
        titleText: 'Balance',
        children: <RNText>Body content</RNText>,
      });

      // Act
      const titleTextNode = testRenderer.root.findAllByType(Text)[0];

      // Assert
      expect(titleTextNode.props.size).toBe(expectedTextSize);
      expect(titleTextNode.props.color).toBe('default');
      expect(titleTextNode.props.weight).toBe('semibold');
    }
  );
});
