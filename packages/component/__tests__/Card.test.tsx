import React from 'react';
import { Pressable, Text as RNText, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { defaultSeedToken } from '@pennyspring/theme';
import { derivative } from '@pennyspring/theme/src/algorithms/derivative';
import { formatToken } from '@pennyspring/theme/src/algorithms/formatToken';
import { Card } from '../src/Card';

const token = formatToken(derivative(defaultSeedToken, false));

const SMALL_PADDING = token.paddingSM;
const NORMAL_PADDING = token.paddingMD;
const LARGE_PADDING = token.paddingLG;
const PLAIN_BACKGROUND = token.colorBgContainer;
const ELEVATED_BACKGROUND = token.colorBgElevated;
const SUMMARY_BACKGROUND = token.colorFillQuaternary;

function renderCard(props: Partial<React.ComponentProps<typeof Card>> = {}) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <ThemeProvider>
        <Card {...props} />
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

    return style === markerStyle || (Array.isArray(style) && style.includes(markerStyle));
  });
}

function findViewNodesWithStyle(
  testRenderer: renderer.ReactTestRenderer,
  markerStyle: Record<string, unknown>,
) {
  return findNodesWithStyle(testRenderer, markerStyle).filter((node) => {
    return node.type === View;
  });
}

function getRootStyle(
  testRenderer: renderer.ReactTestRenderer,
  pressed = false,
) {
  const root = testRenderer.root.findAllByType(Pressable)[0]
    ?? testRenderer.root.findAllByType(View)[0];
  const style = typeof root.props.style === 'function'
    ? root.props.style({ pressed })
    : root.props.style;

  return flattenStyle(style);
}

function getPressableRoot(testRenderer: renderer.ReactTestRenderer) {
  return testRenderer.root.find((node) => {
    return node.props.accessibilityRole === 'button' && node.props.onPress;
  });
}

describe('Card', () => {
  it('renders header body and footer content in order', () => {
    const testRenderer = renderCard({
      title: 'Balance',
      extra: <RNText>More</RNText>,
      footer: <RNText>Footer action</RNText>,
      children: <RNText>Body content</RNText>,
    });
    const treeString = JSON.stringify(testRenderer.toJSON());

    expect(treeString.indexOf('Balance')).toBeLessThan(treeString.indexOf('More'));
    expect(treeString.indexOf('More')).toBeLessThan(treeString.indexOf('Body content'));
    expect(treeString.indexOf('Body content')).toBeLessThan(
      treeString.indexOf('Footer action'),
    );
  });

  it('does not define built-in outer margin on the root style', () => {
    const testRenderer = renderCard({
      children: <RNText>Body content</RNText>,
    });
    const rootStyle = getRootStyle(testRenderer);

    expect(rootStyle.margin).toBeUndefined();
    expect(rootStyle.marginTop).toBeUndefined();
    expect(rootStyle.marginRight).toBeUndefined();
    expect(rootStyle.marginBottom).toBeUndefined();
    expect(rootStyle.marginLeft).toBeUndefined();
    expect(rootStyle.marginHorizontal).toBeUndefined();
    expect(rootStyle.marginVertical).toBeUndefined();
  });

  it('renders primitive title through internal Text with title style', () => {
    const titleStyle = { opacity: 0.91 };
    const testRenderer = renderCard({
      title: 'Budget',
      styles: {
        title: titleStyle,
      },
    });
    const titleNodes = findNodesWithStyle(testRenderer, titleStyle);

    expect(titleNodes).toHaveLength(1);
    expect(titleNodes[0].props.children).toBe('Budget');
  });

  it('renders custom title without applying title style to it', () => {
    const titleStyle = { opacity: 0.81 };
    const customTitleStyle = { opacity: 0.82 };
    const testRenderer = renderCard({
      title: <RNText style={customTitleStyle}>Custom budget</RNText>,
      styles: {
        title: titleStyle,
      },
    });

    expect(findNodesWithStyle(testRenderer, titleStyle)).toHaveLength(0);
    expect(JSON.stringify(testRenderer.toJSON())).toContain('Custom budget');
  });

  it('uses Pressable root and invokes onPress when interactive', () => {
    const onPress = jest.fn();
    const testRenderer = renderCard({
      onPress,
      children: <RNText>Open account</RNText>,
    });
    const root = getPressableRoot(testRenderer);

    act(() => {
      root.props.onPress({} as never);
    });

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('blocks disabled press and applies disabled root style', () => {
    const onPress = jest.fn();
    const rootDisabledStyle = { opacity: 0.31 };
    const testRenderer = renderCard({
      disabled: true,
      onPress,
      styles: {
        rootDisabled: rootDisabledStyle,
      },
      children: <RNText>Disabled account</RNText>,
    });
    const root = getPressableRoot(testRenderer);

    act(() => {
      root.props.onPress({} as never);
    });

    expect(onPress).not.toHaveBeenCalled();
    expect(flattenStyle(root.props.style({ pressed: true })).opacity).toBe(
      rootDisabledStyle.opacity,
    );
  });

  it('blocks loading press and suppresses pressed root style', () => {
    const onPress = jest.fn();
    const rootPressedStyle = { opacity: 0.21 };
    const testRenderer = renderCard({
      loading: true,
      onPress,
      styles: {
        rootPressed: rootPressedStyle,
      },
      children: <RNText>Loading account</RNText>,
    });
    const root = getPressableRoot(testRenderer);

    act(() => {
      root.props.onPress({} as never);
    });

    expect(onPress).not.toHaveBeenCalled();
    expect(root.props.style({ pressed: true })).not.toContain(rootPressedStyle);
  });

  it('replaces children with loadingNode while loading', () => {
    const testRenderer = renderCard({
      loading: true,
      loadingNode: <RNText>Loading summary</RNText>,
      children: <RNText>Loaded summary</RNText>,
    });
    const treeString = JSON.stringify(testRenderer.toJSON());

    expect(treeString).toContain('Loading summary');
    expect(treeString).not.toContain('Loaded summary');
  });

  it('keeps children and applies bodyLoading style when loadingNode is absent', () => {
    const bodyLoadingStyle = { opacity: 0.61 };
    const testRenderer = renderCard({
      loading: true,
      styles: {
        bodyLoading: bodyLoadingStyle,
      },
      children: <RNText>Existing summary</RNText>,
    });
    const treeString = JSON.stringify(testRenderer.toJSON());
    const bodyNodes = findViewNodesWithStyle(testRenderer, bodyLoadingStyle);

    expect(treeString).toContain('Existing summary');
    expect(bodyNodes).toHaveLength(1);
  });

  it('maps size to root padding tokens', () => {
    expect(getRootStyle(renderCard({ size: 'small' })).padding).toBe(SMALL_PADDING);
    expect(getRootStyle(renderCard({ size: 'normal' })).padding).toBe(NORMAL_PADDING);
    expect(getRootStyle(renderCard({ size: 'large' })).padding).toBe(LARGE_PADDING);
  });

  it('maps variant to token-driven root visual styles', () => {
    expect(getRootStyle(renderCard({ variant: 'plain' })).backgroundColor).toBe(
      PLAIN_BACKGROUND,
    );
    expect(getRootStyle(renderCard({ variant: 'elevated' })).backgroundColor).toBe(
      ELEVATED_BACKGROUND,
    );
    expect(getRootStyle(renderCard({ variant: 'summary' })).backgroundColor).toBe(
      SUMMARY_BACKGROUND,
    );
  });

  it('applies root and slot styles after token styles', () => {
    const rootStyle = { flex: 1 };
    const headerStyle = { paddingTop: 0 };
    const extraStyle = { paddingLeft: 0 };
    const bodyStyle = { paddingBottom: 0 };
    const footerStyle = { paddingTop: 0 };
    const rootPressedStyle = { opacity: 0.41 };
    const testRenderer = renderCard({
      onPress: jest.fn(),
      style: rootStyle,
      styles: {
        body: bodyStyle,
        extra: extraStyle,
        footer: footerStyle,
        header: headerStyle,
        rootPressed: rootPressedStyle,
      },
      title: 'Card title',
      extra: <RNText>More</RNText>,
      footer: <RNText>Footer</RNText>,
      children: <RNText>Body</RNText>,
    });
    const root = getPressableRoot(testRenderer);

    expect(root.props.style({ pressed: false })).toContain(rootStyle);
    expect(flattenStyle(root.props.style({ pressed: true })).opacity).toBe(
      rootPressedStyle.opacity,
    );
    expect(flattenStyle(findViewNodesWithStyle(testRenderer, headerStyle)[0].props.style).paddingTop).toBe(0);
    expect(flattenStyle(findViewNodesWithStyle(testRenderer, extraStyle)[0].props.style).paddingLeft).toBe(0);
    expect(flattenStyle(findViewNodesWithStyle(testRenderer, bodyStyle)[0].props.style).paddingBottom).toBe(0);
    expect(flattenStyle(findViewNodesWithStyle(testRenderer, footerStyle)[0].props.style).paddingTop).toBe(0);
  });
});
