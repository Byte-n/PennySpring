import React from 'react';
import { Image, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { defaultSeedToken } from '@pennyspring/theme';
import { derivative } from '@pennyspring/theme/src/algorithms/derivative';
import { formatToken } from '@pennyspring/theme/src/algorithms/formatToken';
import { Text } from '../src/Text';
import { Avatar, formatAvatarText } from '../src/Avatar';

const token = formatToken(derivative(defaultSeedToken, false));

const SMALL_DIMENSION = token.controlHeightSM;
const NORMAL_DIMENSION = token.controlHeight;
const LARGE_DIMENSION = token.controlHeightLG;

function renderAvatar(props: React.ComponentProps<typeof Avatar>) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <ThemeProvider>
        <Avatar {...props} />
      </ThemeProvider>,
    );
  });

  return testRenderer!;
}

function flattenStyle(style: unknown) {
  const styles = Array.isArray(style) ? style : [style];

  return Object.assign({}, ...styles);
}

function getRenderedText(testRenderer: renderer.ReactTestRenderer) {
  return testRenderer.root
    .findAllByType(Text)
    .flatMap(node => node.props.children)
    .join('');
}

describe('Avatar', () => {
  it('renders image before text and icon when src is available', () => {
    const testRenderer = renderAvatar({
      icon: <Text>Icon fallback</Text>,
      src: { uri: 'https://example.com/avatar.png' },
      text: 'Alice',
    });
    const treeString = JSON.stringify(testRenderer.toJSON());

    expect(testRenderer.root.findAllByType(Image)).toHaveLength(1);
    expect(treeString).not.toContain('A');
    expect(treeString).not.toContain('Icon fallback');
  });

  it('renders the first trimmed text character when image is unavailable', () => {
    const testRenderer = renderAvatar({ text: '  Alice  ' });
    const treeString = JSON.stringify(testRenderer.toJSON());

    expect(treeString).toContain('A');
    expect(treeString).not.toContain('Alice');
  });

  it('renders icon when image and text are unavailable', () => {
    const testRenderer = renderAvatar({
      icon: <Text>Icon fallback</Text>,
      text: '   ',
    });
    const treeString = JSON.stringify(testRenderer.toJSON());

    expect(treeString).toContain('Icon fallback');
  });

  it('renders an empty visual surface without image text or icon content', () => {
    const testRenderer = renderAvatar({});
    const tree = testRenderer.toJSON();

    expect(testRenderer.root.findAllByType(View)).toHaveLength(1);
    expect(testRenderer.root.findAllByType(Image)).toHaveLength(0);
    expect(Array.isArray(tree) ? tree[0] : tree).toMatchObject({
      children: null,
    });
  });

  it('formats avatar text with only the first trimmed character', () => {
    expect(formatAvatarText('  Penny  ')).toBe('P');
    expect(formatAvatarText('   ')).toBe('');
  });

  it('falls back to text and calls onError after image load fails', () => {
    const onError = jest.fn();
    const testRenderer = renderAvatar({
      onError,
      src: { uri: 'https://example.com/broken.png' },
      text: 'Penny',
    });

    act(() => {
      testRenderer.root.findByType(Image).props.onError();
    });

    const treeString = JSON.stringify(testRenderer.toJSON());

    expect(onError).toHaveBeenCalledTimes(1);
    expect(testRenderer.root.findAllByType(Image)).toHaveLength(0);
    expect(treeString).toContain('P');
  });

  it('renders a new image again when src changes after an error', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ThemeProvider>
          <Avatar
            src={{ uri: 'https://example.com/broken.png' }}
            text="Penny"
          />
        </ThemeProvider>,
      );
    });

    act(() => {
      testRenderer!.root.findByType(Image).props.onError();
    });

    expect(testRenderer!.root.findAllByType(Image)).toHaveLength(0);

    act(() => {
      testRenderer!.update(
        <ThemeProvider>
          <Avatar
            src={{ uri: 'https://example.com/new.png' }}
            text="Penny"
          />
        </ThemeProvider>,
      );
    });

    expect(testRenderer!.root.findAllByType(Image)).toHaveLength(1);
  });

  it('maps size to stable token dimensions', () => {
    const smallRenderer = renderAvatar({ size: 'small' });
    const normalRenderer = renderAvatar({ size: 'normal' });
    const largeRenderer = renderAvatar({ size: 'large' });

    expect(flattenStyle(smallRenderer.root.findByType(View).props.style).width)
      .toBe(SMALL_DIMENSION);
    expect(flattenStyle(normalRenderer.root.findByType(View).props.style).width)
      .toBe(NORMAL_DIMENSION);
    expect(flattenStyle(largeRenderer.root.findByType(View).props.style).width)
      .toBe(LARGE_DIMENSION);
  });

  it('uses token radius for square shape instead of circle radius', () => {
    const testRenderer = renderAvatar({
      shape: 'square',
      size: 'normal',
    });
    const rootStyle = flattenStyle(testRenderer.root.findByType(View).props.style);

    expect(rootStyle.borderRadius).toBe(token.borderRadius);
    expect(rootStyle.borderRadius).not.toBe(NORMAL_DIMENSION);
  });

  it('applies disabled root styling and disabled slot override', () => {
    const rootDisabledStyle = { opacity: 0.37 };
    const testRenderer = renderAvatar({
      disabled: true,
      styles: {
        rootDisabled: rootDisabledStyle,
      },
    });
    const rootStyle = testRenderer.root.findByType(View).props.style;

    expect(rootStyle).toContain(rootDisabledStyle);
    expect(flattenStyle(rootStyle).backgroundColor)
      .toBe(token.colorBgContainerDisabled);
  });

  it('applies stable slot style overrides to image text and icon', () => {
    const imageStyle = { opacity: 0.91 };
    const textStyle = { opacity: 0.92 };
    const iconStyle = { opacity: 0.93 };

    expect(
      renderAvatar({
        src: { uri: 'https://example.com/avatar.png' },
        styles: { image: imageStyle },
      }).root.findByType(Image).props.style,
    ).toContain(imageStyle);
    expect(
      renderAvatar({
        styles: { text: textStyle },
        text: 'Penny',
      }).root.findByType(Text).props.style,
    ).toContain(textStyle);
    expect(
      renderAvatar({
        icon: <Text>Icon fallback</Text>,
        styles: { icon: iconStyle },
      }).root.findAllByType(View).some(node => {
        const style = node.props.style;

        return Array.isArray(style) && style.includes(iconStyle);
      }),
    ).toBe(true);
  });
});

describe('Avatar.Group', () => {
  it('renders visible avatars and rest count from maxCount', () => {
    const testRenderer = renderAvatarGroup({
      items: [
        { key: 'alice', text: 'Alice' },
        { key: 'bob', text: 'Bob' },
        { key: 'cora', text: 'Cora' },
        { key: 'dana', text: 'Dana' },
      ],
      maxCount: 2,
    });
    const renderedText = getRenderedText(testRenderer);

    expect(renderedText).toContain('A');
    expect(renderedText).toContain('B');
    expect(renderedText).not.toContain('C');
    expect(renderedText).not.toContain('D');
    expect(renderedText).toContain('+2');
  });

  it('uses default maxCount when maxCount is invalid', () => {
    const testRenderer = renderAvatarGroup({
      items: [
        { key: 'alice', text: 'Alice' },
        { key: 'bob', text: 'Bob' },
        { key: 'cora', text: 'Cora' },
        { key: 'dana', text: 'Dana' },
      ],
      maxCount: Number.POSITIVE_INFINITY,
    });
    const renderedText = getRenderedText(testRenderer);

    expect(renderedText).toContain('A');
    expect(renderedText).toContain('B');
    expect(renderedText).toContain('C');
    expect(renderedText).not.toContain('D');
    expect(renderedText).toContain('+1');
  });

  it('passes group size to items while preserving explicit item size', () => {
    const itemStyle = { opacity: 0.82 };
    const testRenderer = renderAvatarGroup({
      items: [
        { key: 'alice', text: 'Alice' },
        { key: 'bob', size: 'small', text: 'Bob' },
      ],
      size: 'large',
      styles: {
        item: itemStyle,
      },
    });
    const avatarRoots = testRenderer.root
      .findAllByType(View)
      .filter(node => flattenStyle(node.props.style).overflow === 'hidden');

    expect(flattenStyle(avatarRoots[0].props.style).width).toBe(LARGE_DIMENSION);
    expect(flattenStyle(avatarRoots[1].props.style).width).toBe(SMALL_DIMENSION);
  });

  it('does not render rest count when all items are visible', () => {
    const testRenderer = renderAvatarGroup({
      items: [
        { key: 'alice', text: 'Alice' },
        { key: 'bob', text: 'Bob' },
      ],
      maxCount: 3,
    });
    const treeString = JSON.stringify(testRenderer.toJSON());

    expect(treeString).not.toContain('+');
  });
});

function renderAvatarGroup(props: React.ComponentProps<typeof Avatar.Group>) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <ThemeProvider>
        <Avatar.Group {...props} />
      </ThemeProvider>,
    );
  });

  return testRenderer!;
}
