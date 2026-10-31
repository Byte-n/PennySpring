import React from 'react';
import { Image as RNImage } from 'react-native';
import renderer, { act } from 'react-test-renderer';

import { Image } from '../src/Image';

const IMAGE_A = { uri: 'file:///a.jpg' };
const IMAGE_B = { uri: 'file:///b.jpg' };
const IMAGE_C = { uri: 'file:///c.jpg' };

function render(element: React.ReactElement): renderer.ReactTestRenderer {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(element);
  });

  return testRenderer!;
}

function press(node: renderer.ReactTestInstance): void {
  act(() => {
    node.props.onPress();
  });
}

function pressByTestID(
  testRenderer: renderer.ReactTestRenderer,
  testID: string,
): void {
  const node = testRenderer.root
    .findAllByProps({ testID })
    .find(candidate => typeof candidate.props.onPress === 'function');

  if (!node) {
    throw new Error(`Pressable not found: ${testID}`);
  }

  press(node);
}

function hasPreview(testRenderer: renderer.ReactTestRenderer): boolean {
  return (
    testRenderer.root.findAllByProps({ testID: 'image-preview-root' })
      .length > 0
  );
}

describe('Image', () => {
  it('renders the source image inside the frame', () => {
    const testRenderer = render(<Image src={IMAGE_A} testID="image" />);
    const images = testRenderer.root.findAllByType(RNImage);

    expect(images).toHaveLength(1);
    expect(images[0].props.source).toEqual(IMAGE_A);
  });

  it('opens a single-image preview only when preview is enabled', () => {
    const testRenderer = render(
      <Image preview src={IMAGE_A} testID="image" />,
    );

    pressByTestID(testRenderer, 'image');

    expect(hasPreview(testRenderer)).toBe(true);
    expect(
      testRenderer.root.findAllByProps({ testID: 'image-preview-count' }),
    ).toHaveLength(0);
  });

  it('does not open a preview by default', () => {
    const testRenderer = render(<Image src={IMAGE_A} testID="image" />);

    pressByTestID(testRenderer, 'image');

    expect(hasPreview(testRenderer)).toBe(false);
  });

  it('does not open a preview when preview is false', () => {
    const testRenderer = render(
      <Image preview={false} src={IMAGE_A} testID="image" />,
    );

    pressByTestID(testRenderer, 'image');

    expect(hasPreview(testRenderer)).toBe(false);
  });

  it('renders a custom error slot and retries on press', () => {
    const testRenderer = render(
      <Image
        error={<RNImage testID="custom-error" />}
        src={IMAGE_A}
        testID="image"
      />,
    );

    act(() => {
      testRenderer.root.findByType(RNImage).props.onError();
    });

    expect(
      testRenderer.root.findAllByProps({ testID: 'custom-error' }).length,
    ).toBeGreaterThan(0);

    pressByTestID(testRenderer, 'image');

    expect(testRenderer.root.findAllByProps({ testID: 'custom-error' })).toHaveLength(0);
    expect(hasPreview(testRenderer)).toBe(false);
  });

  it('supports a controlled single-image preview config', () => {
    const onOpenChange = jest.fn();
    const testRenderer = render(
      <Image
        preview={{ onOpenChange, open: true }}
        src={IMAGE_A}
      />,
    );

    expect(hasPreview(testRenderer)).toBe(true);

    pressByTestID(testRenderer, 'image-preview-close');

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe('Image.PreviewGroup', () => {
  it('registers child images and opens the pressed index', () => {
    const onIndexChange = jest.fn();
    const onOpenChange = jest.fn();
    const testRenderer = render(
      <Image.PreviewGroup
        onIndexChange={onIndexChange}
        onOpenChange={onOpenChange}
      >
        <Image src={IMAGE_A} testID="image-a" />
        <Image src={IMAGE_B} testID="image-b" />
        <Image src={IMAGE_C} testID="image-c" />
      </Image.PreviewGroup>,
    );

    pressByTestID(testRenderer, 'image-b');

    expect(hasPreview(testRenderer)).toBe(true);
    expect(JSON.stringify(testRenderer.toJSON())).toContain('2 / 3');
    expect(onIndexChange).toHaveBeenCalledWith(1);
    expect(onOpenChange).toHaveBeenCalledWith(true);

    pressByTestID(testRenderer, 'image-preview-close');

    expect(hasPreview(testRenderer)).toBe(false);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('includes a child even when preview is disabled on Image', () => {
    const testRenderer = render(
      <Image.PreviewGroup>
        <Image preview={false} src={IMAGE_A} testID="image-a" />
      </Image.PreviewGroup>,
    );

    pressByTestID(testRenderer, 'image-a');

    expect(hasPreview(testRenderer)).toBe(true);
  });

  it('ignores a preview source override inside PreviewGroup', () => {
    const testRenderer = render(
      <Image.PreviewGroup>
        <Image
          preview={{ src: IMAGE_B }}
          src={IMAGE_A}
          testID="image-a"
        />
      </Image.PreviewGroup>,
    );

    pressByTestID(testRenderer, 'image-a');

    const previewImages = testRenderer.root
      .findAllByType(RNImage)
      .filter(node => node.props.testID === 'image-preview-image');

    expect(previewImages.map(node => node.props.source)).toEqual([IMAGE_A]);
  });

  it('prefers items over registered children', () => {
    const testRenderer = render(
      <Image.PreviewGroup items={[IMAGE_B, IMAGE_C]}>
        <Image src={IMAGE_A} testID="image-a" />
      </Image.PreviewGroup>,
    );

    pressByTestID(testRenderer, 'image-a');

    const previewImages = testRenderer.root
      .findAllByType(RNImage)
      .filter(node => node.props.testID === 'image-preview-image');

    expect(previewImages).toHaveLength(2);
    expect(previewImages.map(node => node.props.source)).toEqual([
      IMAGE_B,
      IMAGE_C,
    ]);
    expect(JSON.stringify(testRenderer.toJSON())).toContain('1 / 2');
  });

  it('renders data-only items when controlled open', () => {
    const testRenderer = render(
      <Image.PreviewGroup
        index={1}
        items={[IMAGE_A, IMAGE_B]}
        open
      />,
    );

    expect(hasPreview(testRenderer)).toBe(true);
    expect(JSON.stringify(testRenderer.toJSON())).toContain('2 / 2');
  });
});

describe('Image.Preview', () => {
  it('closes through onOpenChange and onCancel', () => {
    const onCancel = jest.fn();
    const onOpenChange = jest.fn();
    const testRenderer = render(
      <Image.Preview
        images={[IMAGE_A, IMAGE_B]}
        index={1}
        onCancel={onCancel}
        onOpenChange={onOpenChange}
        open
      />,
    );

    expect(JSON.stringify(testRenderer.toJSON())).toContain('2 / 2');

    pressByTestID(testRenderer, 'image-preview-close');

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('hides the counter for a single image', () => {
    const testRenderer = render(
      <Image.Preview images={[IMAGE_A]} open />,
    );

    expect(
      testRenderer.root.findAllByProps({ testID: 'image-preview-count' }),
    ).toHaveLength(0);
  });

  it('renders the preview error state and retries on press', () => {
    const testRenderer = render(
      <Image.Preview images={[IMAGE_A]} open />,
    );
    const previewImage = testRenderer.root
      .findAllByType(RNImage)
      .find(node => node.props.testID === 'image-preview-image');

    expect(previewImage).toBeDefined();

    act(() => {
      previewImage!.props.onError();
    });

    expect(
      testRenderer.root.findAllByProps({
        testID: 'image-preview-error',
      }).length,
    ).toBeGreaterThan(0);

    pressByTestID(testRenderer, 'image-preview-error');

    expect(
      testRenderer.root.findAllByProps({ testID: 'image-preview-error' }),
    ).toHaveLength(0);
  });

  it('renders nothing when there are no images', () => {
    const testRenderer = render(<Image.Preview images={[]} open />);

    expect(testRenderer.toJSON()).toBeNull();
  });
});
