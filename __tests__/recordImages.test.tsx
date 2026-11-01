import React from 'react';
import { Image, Text as RNText } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

const mockMedia = {
  resolveSource: (ref: string) => ({
    uri: ref.startsWith('media:') ? `https://example.com/${ref}` : ref,
  }),
};

jest.mock('../src/media', () => ({
  useMediaStore: () => mockMedia,
}));

jest.mock('@pennyspring/theme', () => ({
  createUseSheetStyle: () => () => ({}),
}));

jest.mock('@pennyspring/ui', () => {
  const ReactLib = require('react');
  const { Image: RNImage, Text, View } = require('react-native');

  const MockImage = ({
    src,
    testID,
  }: {
    src?: Record<string, unknown>;
    testID?: string;
  }) => ReactLib.createElement(RNImage, { source: src, testID });

  const MockImagePreview = ({
    images,
    index,
    open,
  }: {
    images: readonly unknown[];
    index?: number;
    open?: boolean;
  }) =>
    open
      ? ReactLib.createElement(View, {
          testID: 'record-image-preview',
          imageCount: images.length,
          index,
        })
      : null;

  const theme = jest.requireMock('@pennyspring/theme');

  return {
    ...theme,
    Image: MockImage,
    ImagePreview: MockImagePreview,
    Row: ({ children, ...props }: { children?: React.ReactNode }) =>
      ReactLib.createElement(View, props, children),
    Text: ({ children }: { children?: React.ReactNode }) =>
      ReactLib.createElement(Text, null, children),
  };
});

import { RecordImages } from '../src/screens/home/tabs/detail/RecordImages';

const IMAGE_PATHS = ['media:a.jpg', 'media:b.png', 'file:///local/c.jpg'];

async function renderRecordImages(): Promise<TestRenderer.ReactTestRenderer> {
  let renderer: TestRenderer.ReactTestRenderer;

  await act(async () => {
    renderer = TestRenderer.create(
      <RecordImages imagePaths={IMAGE_PATHS} recordId={9} />,
    );
    await new Promise(resolve => setTimeout(resolve, 0));
  });

  return renderer!;
}

describe('RecordImages', () => {
  it('resolves supplied media refs for thumbnails', async () => {
    const renderer = await renderRecordImages();

    const images = renderer.root.findAllByType(Image);

    expect(images).toHaveLength(3);
    expect(images.map(image => image.props.source)).toEqual([
      { uri: 'https://example.com/media:a.jpg' },
      { uri: 'https://example.com/media:b.png' },
      { uri: 'file:///local/c.jpg' },
    ]);
  });

  it('opens the preview at the pressed image index', async () => {
    const renderer = await renderRecordImages();

    act(() => {
      renderer.root
        .findByProps({ testID: 'record-detail-image-1' })
        .props.onPress();
    });

    expect(
      renderer.root.findByProps({ testID: 'record-image-preview' }).props,
    ).toMatchObject({ imageCount: 3, index: 1 });
  });

  it('shows an empty image count when the detail has no images', async () => {
    let renderer: TestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = TestRenderer.create(
        <RecordImages imagePaths={[]} recordId={9} />,
      );
    });

    expect(
      renderer!.root.findAllByType(RNText).map(node => node.props.children),
    ).toContain('0 张');
    act(() => {
      renderer!.unmount();
    });
  });
});
