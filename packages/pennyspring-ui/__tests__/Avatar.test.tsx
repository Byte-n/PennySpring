import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Text } from '../src/Text';
import { Row } from '../src/Row';
import { Avatar } from '../src/Avatar';
function renderAvatar(props: React.ComponentProps<typeof Avatar>) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><Avatar {...props} /></>);
  });
  return testRenderer!;
}
function getRenderedText(testRenderer: renderer.ReactTestRenderer) {
  return testRenderer.root.findAllByType(Text).flatMap(node => node.props.children).join('');
}
describe('Avatar', () => {
  it('renders image before text and icon when src is available', () => {
    const testRenderer = renderAvatar({
      icon: <Text>Icon fallback</Text>,
      src: {
        uri: 'https://example.com/avatar.png'
      },
      text: 'Alice'
    });
    const treeString = JSON.stringify(testRenderer.toJSON());
    expect(testRenderer.root.findAllByType(Image)).toHaveLength(1);
    expect(treeString).not.toContain('A');
    expect(treeString).not.toContain('Icon fallback');
  });
  it('renders the first trimmed text character when image is unavailable', () => {
    const testRenderer = renderAvatar({
      text: '  Alice  '
    });
    const treeString = JSON.stringify(testRenderer.toJSON());
    expect(treeString).toContain('A');
    expect(treeString).not.toContain('Alice');
  });
  it('passes text size and semantic color through Text props when text is displayed', () => {
    // Arrange
    const testRenderer = renderAvatar({
      size: 'small',
      text: 'Alice'
    });

    // Act
    const avatarText = testRenderer.root.findByType(Text);

    // Assert
    expect(avatarText.props.size).toBe('sm');
    expect(avatarText.props.color).toBe('default');
  });
  it('maps text size prop across component sizes', () => {
    // Arrange
    const normalRenderer = renderAvatar({
      size: 'normal',
      text: 'Alice'
    });
    const largeRenderer = renderAvatar({
      size: 'large',
      text: 'Alice'
    });

    // Act
    const normalText = normalRenderer.root.findByType(Text);
    const largeText = largeRenderer.root.findByType(Text);

    // Assert
    expect(normalText.props.size).toBe('md');
    expect(largeText.props.size).toBe('lg');
  });
  it('does not inject typography semantics through Avatar internal text style', () => {
    // Arrange
    const testRenderer = renderAvatar({
      size: 'large',
      text: 'Alice'
    });

    // Act
    const avatarText = testRenderer.root.findByType(Text);
    const flattenedStyle = StyleSheet.flatten(avatarText.props.style);

    // Assert
    expect(flattenedStyle?.fontFamily).toBeUndefined();
    expect(flattenedStyle?.fontSize).toBeUndefined();
    expect(flattenedStyle?.fontWeight).toBeUndefined();
    expect(flattenedStyle?.lineHeight).toBeUndefined();
    expect(flattenedStyle?.color).toBeUndefined();
  });
  it('renders icon when image and text are unavailable', () => {
    const testRenderer = renderAvatar({
      icon: <Text>Icon fallback</Text>,
      text: '   '
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
      children: null
    });
  });
  it('falls back to text and calls onError after image load fails', () => {
    const onError = jest.fn();
    const testRenderer = renderAvatar({
      onError,
      src: {
        uri: 'https://example.com/broken.png'
      },
      text: 'Penny'
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
      testRenderer = renderer.create(<><Avatar src={{
          uri: 'https://example.com/broken.png'
        }} text="Penny" /></>);
    });
    act(() => {
      testRenderer!.root.findByType(Image).props.onError();
    });
    expect(testRenderer!.root.findAllByType(Image)).toHaveLength(0);
    act(() => {
      testRenderer!.update(<><Avatar src={{
          uri: 'https://example.com/new.png'
        }} text="Penny" /></>);
    });
    expect(testRenderer!.root.findAllByType(Image)).toHaveLength(1);
  });
});
describe('Avatar.Group', () => {
  it('renders visible avatars and rest count from maxCount', () => {
    const testRenderer = renderAvatarGroup({
      items: [{
        key: 'alice',
        text: 'Alice'
      }, {
        key: 'bob',
        text: 'Bob'
      }, {
        key: 'cora',
        text: 'Cora'
      }, {
        key: 'dana',
        text: 'Dana'
      }],
      maxCount: 2
    });
    const renderedText = getRenderedText(testRenderer);
    expect(renderedText).toContain('A');
    expect(renderedText).toContain('B');
    expect(renderedText).not.toContain('C');
    expect(renderedText).not.toContain('D');
    expect(renderedText).toContain('+2');
  });
  it('uses Row as the root layout container for horizontal avatar composition', () => {
    // Arrange
    const testRenderer = renderAvatarGroup({
      items: [{
        key: 'alice',
        text: 'Alice'
      }, {
        key: 'bob',
        text: 'Bob'
      }]
    });

    // Act
    const rootRows = testRenderer.root.findAllByType(Row);

    // Assert
    expect(rootRows).toHaveLength(1);
  });
  it('passes semantic text props for rest count content', () => {
    // Arrange
    const testRenderer = renderAvatarGroup({
      items: [{
        key: 'alice',
        text: 'Alice'
      }, {
        key: 'bob',
        text: 'Bob'
      }, {
        key: 'cora',
        text: 'Cora'
      }],
      maxCount: 2,
      size: 'normal'
    });

    // Act
    const restText = testRenderer.root.findAllByType(Text).find(node => node.props.children === '+1');

    // Assert
    expect(restText?.props.color).toBe('secondary');
    expect(restText?.props.size).toBe('md');
    expect(restText?.props.weight).toBe('strong');
  });
  it('uses default maxCount when maxCount is invalid', () => {
    const testRenderer = renderAvatarGroup({
      items: [{
        key: 'alice',
        text: 'Alice'
      }, {
        key: 'bob',
        text: 'Bob'
      }, {
        key: 'cora',
        text: 'Cora'
      }, {
        key: 'dana',
        text: 'Dana'
      }],
      maxCount: Number.POSITIVE_INFINITY
    });
    const renderedText = getRenderedText(testRenderer);
    expect(renderedText).toContain('A');
    expect(renderedText).toContain('B');
    expect(renderedText).toContain('C');
    expect(renderedText).not.toContain('D');
    expect(renderedText).toContain('+1');
  });
  it('does not render rest count when all items are visible', () => {
    const testRenderer = renderAvatarGroup({
      items: [{
        key: 'alice',
        text: 'Alice'
      }, {
        key: 'bob',
        text: 'Bob'
      }],
      maxCount: 3
    });
    const treeString = JSON.stringify(testRenderer.toJSON());
    expect(treeString).not.toContain('+');
  });
  it('scales rest count capsule styles with group size', () => {
    const smallRenderer = renderAvatarGroup({
      items: [{
        key: 'alice',
        text: 'Alice'
      }, {
        key: 'bob',
        text: 'Bob'
      }, {
        key: 'cora',
        text: 'Cora'
      }],
      maxCount: 2,
      size: 'small'
    });
    const normalRenderer = renderAvatarGroup({
      items: [{
        key: 'alice',
        text: 'Alice'
      }, {
        key: 'bob',
        text: 'Bob'
      }, {
        key: 'cora',
        text: 'Cora'
      }],
      maxCount: 2,
      size: 'normal'
    });
    const largeRenderer = renderAvatarGroup({
      items: [{
        key: 'alice',
        text: 'Alice'
      }, {
        key: 'bob',
        text: 'Bob'
      }, {
        key: 'cora',
        text: 'Cora'
      }],
      maxCount: 2,
      size: 'large'
    });

    const smallRest = getRestCapsuleStyles(smallRenderer);
    const normalRest = getRestCapsuleStyles(normalRenderer);
    const largeRest = getRestCapsuleStyles(largeRenderer);

    expect(smallRest.containerStyle.height).toBeLessThan(normalRest.containerStyle.height);
    expect(normalRest.containerStyle.height).toBeLessThan(largeRest.containerStyle.height);
    expect(smallRest.containerStyle.paddingHorizontal).toBeLessThan(normalRest.containerStyle.paddingHorizontal);
    expect(normalRest.containerStyle.paddingHorizontal).toBeLessThan(largeRest.containerStyle.paddingHorizontal);
  });
});
function renderAvatarGroup(props: React.ComponentProps<typeof Avatar.Group>) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><Avatar.Group {...props} /></>);
  });
  return testRenderer!;
}

function getRestCapsuleStyles(testRenderer: renderer.ReactTestRenderer) {
  const restText = testRenderer.root
    .findAllByType(Text)
    .find(node => node.props.children === '+1');

  if (restText === undefined) {
    throw new Error('Avatar.Group rest count text was not rendered');
  }

  const restContainer = restText.parent;
  if (restContainer === null) {
    throw new Error('Avatar.Group rest count container was not rendered');
  }

  return {
    containerStyle: StyleSheet.flatten(restContainer.props.style),
    textStyle: StyleSheet.flatten(restText.props.style),
  };
}
