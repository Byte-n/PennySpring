import React from 'react';
import { Image, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Text } from '../src/Text';
import { Avatar, formatAvatarText } from '../src/Avatar';
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
  it('formats avatar text with only the first trimmed character', () => {
    expect(formatAvatarText('  Penny  ')).toBe('P');
    expect(formatAvatarText('   ')).toBe('');
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
});
function renderAvatarGroup(props: React.ComponentProps<typeof Avatar.Group>) {
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><Avatar.Group {...props} /></>);
  });
  return testRenderer!;
}
