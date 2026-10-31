import React from 'react';
import { Image, Text as RNText } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

const mockGetDetailById = jest.fn();
const mockGlobalApi = {
  record: { getDetailById: mockGetDetailById },
};
const mockMedia = {
  resolveUri: (ref: string) =>
    ref.startsWith('media:') ? `https://example.com/${ref}` : ref,
};

jest.mock('../src/stores/bookStore', () => ({
  useGlobalApi: () => mockGlobalApi,
}));

jest.mock('../src/media', () => ({
  useMediaStore: () => mockMedia,
}));

jest.mock('@pennyspring/theme', () => ({
  createUseSheetStyle: () => () => ({}),
}));

jest.mock('@pennyspring/ui', () => {
  const ReactLib = require('react');
  const {
    Image: RNImage,
    Text,
    View,
  } = require('react-native');

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

  return {
    Image: MockImage,
    ImagePreview: MockImagePreview,
    Row: ({ children, ...props }: { children?: React.ReactNode }) =>
      ReactLib.createElement(View, props, children),
    Text: ({ children }: { children?: React.ReactNode }) =>
      ReactLib.createElement(Text, null, children),
  };
});

import { RecordImages } from '../src/screens/home/tabs/detail/RecordImages';

const RECORD_DETAIL = {
  record: { id: 9 },
  imagePaths: ['media:a.jpg', 'media:b.png', 'file:///local/c.jpg'],
};

async function renderRecordImages(): Promise<TestRenderer.ReactTestRenderer> {
  let renderer: TestRenderer.ReactTestRenderer;

  await act(async () => {
    renderer = TestRenderer.create(
      <RecordImages booksId={1} imageCount={3} recordId={9} />,
    );
    await new Promise(resolve => setTimeout(resolve, 0));
  });

  return renderer!;
}

describe('RecordImages', () => {
  beforeEach(() => {
    mockGetDetailById.mockReset();
    mockGetDetailById.mockResolvedValue(RECORD_DETAIL);
  });

  it('loads record images and resolves media refs for thumbnails', async () => {
    const renderer = await renderRecordImages();

    expect(mockGetDetailById).toHaveBeenCalledWith(9, 1);
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

  it('keeps the image count visible while the detail request is pending', async () => {
    let resolveDetail: ((value: unknown) => void) | null = null;
    mockGetDetailById.mockImplementation(
      () =>
        new Promise(resolve => {
          resolveDetail = resolve;
        }),
    );

    let renderer: TestRenderer.ReactTestRenderer;
    act(() => {
      renderer = TestRenderer.create(
        <RecordImages booksId={1} imageCount={3} recordId={9} />,
      );
    });

    expect(
      renderer!.root.findAllByType(RNText).map(node => node.props.children),
    ).toContain('3 张');

    await act(async () => {
      resolveDetail?.(RECORD_DETAIL);
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    act(() => {
      renderer!.unmount();
    });
  });
});
