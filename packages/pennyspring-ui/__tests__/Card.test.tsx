import React from 'react';
import { StyleSheet, Text as RNText, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { Card } from '../src/Card';
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
      title: 'Balance',
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
  it('uses a clean elevated surface for summary variant', () => {
    const shadowToken = {
      shadowColor: 'summaryShadowToken',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.02,
      shadowRadius: 4,
      elevation: 2
    };
    let testRenderer: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(
        <ThemeProvider config={{
          token: {
            colorBgContainer: 'summaryContainerToken',
            colorPrimaryBorder: 'summaryBorderToken',
            boxShadowTertiary: shadowToken
          }
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
    expect(rootStyle.borderColor).toBe('summaryBorderToken');
    expect(rootStyle.shadowColor).toBe('summaryShadowToken');
    expect(rootStyle.shadowRadius).toBe(shadowToken.shadowRadius);
  });
  it.each([
    ['small', 11, 3],
    ['normal', 13, 5],
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
    const headerStyle = StyleSheet.flatten(views[1].props.style);
    const footerStyle = StyleSheet.flatten(views.at(-1)?.props.style);

    expect(rootStyle.padding).toBe(expectedPadding);
    expect(headerStyle.gap).toBe(expectedGap);
    expect(headerStyle.marginBottom).toBe(expectedGap);
    expect(footerStyle.marginTop).toBe(expectedGap);
    expect(footerStyle.paddingTop).toBe(expectedGap);
  });
});
