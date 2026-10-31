import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { ImagePicker } from '../src/ImagePicker';
import {
  pickImageFromCamera,
  pickImageFromFiles,
  pickImageFromLibrary,
} from '../src/ImagePicker/nativePickers';
import type {
  ImagePickerActionSheetProps,
  ImagePickerValue,
} from '../src/ImagePicker';

jest.mock('../src/ImagePicker/nativePickers', () => ({
  pickImageFromCamera: jest.fn(),
  pickImageFromFiles: jest.fn(),
  pickImageFromLibrary: jest.fn(),
}));

const mockPickImageFromFiles = jest.mocked(pickImageFromFiles);
const mockPickImageFromLibrary = jest.mocked(pickImageFromLibrary);
const mockPickImageFromCamera = jest.mocked(pickImageFromCamera);

function renderActionSheet(
  props: Partial<ImagePickerActionSheetProps> = {},
): renderer.ReactTestRenderer {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <ImagePicker.ActionSheet open {...(props as ImagePickerActionSheetProps)} />,
    );
  });

  return testRenderer!;
}

async function pressAction(
  testRenderer: renderer.ReactTestRenderer,
  index = 0,
): Promise<void> {
  await act(async () => {
    testRenderer.root
      .findByProps({ testID: `action-sheet-action-${index}` })
      .props.onPress();
    await Promise.resolve();
  });
}

describe('ImagePicker.ActionSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders source actions with localized labels', () => {
    const testRenderer = renderActionSheet({
      sources: ['camera', 'photo', 'fileSystem'],
    });
    const tree = JSON.stringify(testRenderer.toJSON());

    expect(tree).toContain('拍照');
    expect(tree).toContain('相册');
    expect(tree).toContain('文件');
  });

  it('picks a single image from the library and emits it', async () => {
    const nextValue: ImagePickerValue = {
      uri: 'file:///library-image.jpg',
      fileName: 'library-image.jpg',
    };
    const onChange = jest.fn();
    const onOpenChange = jest.fn();
    mockPickImageFromLibrary.mockResolvedValue(nextValue);
    const testRenderer = renderActionSheet({
      onChange,
      onOpenChange,
      sources: ['photo'],
    });

    await pressAction(testRenderer);

    expect(mockPickImageFromLibrary).toHaveBeenCalledWith({
      maxCount: 1,
      multiple: false,
      includeBase64: false,
    });
    expect(onChange).toHaveBeenCalledWith(nextValue);
    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: 'action' });
  });

  it('replaces the current value in single mode', async () => {
    const onChange = jest.fn();
    mockPickImageFromLibrary.mockResolvedValue({
      uri: 'file:///next.jpg',
      fileName: 'next.jpg',
    });
    const testRenderer = renderActionSheet({
      onChange,
      sources: ['photo'],
      value: { uri: 'file:///first.jpg', fileName: 'first.jpg' },
    });

    await pressAction(testRenderer);

    expect(onChange).toHaveBeenCalledWith({
      uri: 'file:///next.jpg',
      fileName: 'next.jpg',
    });
  });

  it('merges picked images in multiple mode and respects maxCount', async () => {
    const first: ImagePickerValue = { uri: 'file:///first.jpg' };
    const second: ImagePickerValue = { uri: 'file:///second.jpg' };
    const third: ImagePickerValue = { uri: 'file:///third.jpg' };
    const onChange = jest.fn();
    mockPickImageFromLibrary.mockResolvedValue([second, third]);
    const testRenderer = renderActionSheet({
      maxCount: 2,
      multiple: true,
      onChange,
      sources: ['photo'],
      value: [first],
    });

    await pressAction(testRenderer);

    expect(mockPickImageFromLibrary).toHaveBeenCalledWith({
      maxCount: 1,
      multiple: true,
      includeBase64: false,
    });
    expect(onChange).toHaveBeenCalledWith([first, second]);
  });

  it('picks from the camera without multi selection', async () => {
    mockPickImageFromCamera.mockResolvedValue(undefined);
    const testRenderer = renderActionSheet({
      maxCount: 4,
      multiple: true,
      sources: ['camera'],
    });

    await pressAction(testRenderer);

    expect(mockPickImageFromCamera).toHaveBeenCalledWith({
      maxCount: 4,
      multiple: false,
      includeBase64: false,
    });
  });

  it('picks from the file system with picker options forwarded', async () => {
    const onChange = jest.fn();
    mockPickImageFromFiles.mockResolvedValue([
      { uri: 'file:///file-image.png', name: 'file-image.png' },
    ]);
    const testRenderer = renderActionSheet({
      includeBase64: true,
      maxCount: 4,
      maxHeight: 1_600,
      maxWidth: 1_600,
      multiple: true,
      onChange,
      quality: 0.8,
      sources: ['fileSystem'],
    });

    await pressAction(testRenderer);

    expect(mockPickImageFromFiles).toHaveBeenCalledWith({
      maxCount: 4,
      multiple: true,
      includeBase64: true,
      maxWidth: 1_600,
      maxHeight: 1_600,
      quality: 0.8,
    });
    expect(onChange).toHaveBeenCalledWith([
      { uri: 'file:///file-image.png', name: 'file-image.png' },
    ]);
  });

  it('does not emit a change when the native picker is cancelled', async () => {
    const onChange = jest.fn();
    mockPickImageFromLibrary.mockResolvedValue(undefined);
    const testRenderer = renderActionSheet({
      onChange,
      sources: ['photo'],
    });

    await pressAction(testRenderer);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('reports native picker errors without changing the value', async () => {
    const error = new Error('Native picker failed');
    const onChange = jest.fn();
    const onError = jest.fn();
    mockPickImageFromFiles.mockRejectedValue(error);
    const testRenderer = renderActionSheet({
      onChange,
      onError,
      sources: ['fileSystem'],
    });

    await pressAction(testRenderer);

    expect(onError).toHaveBeenCalledWith(error);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('disables source actions when the multiple limit is reached', async () => {
    const testRenderer = renderActionSheet({
      maxCount: 2,
      multiple: true,
      sources: ['photo'],
      value: [{ uri: 'file:///first.jpg' }, { uri: 'file:///second.jpg' }],
    });
    const action = testRenderer.root.findByProps({
      testID: 'action-sheet-action-0',
    });

    expect(action.props.disabled).toBe(true);
    await pressAction(testRenderer);
    expect(mockPickImageFromLibrary).not.toHaveBeenCalled();
  });

  it('reports cancel through onOpenChange', async () => {
    const onOpenChange = jest.fn();
    const testRenderer = renderActionSheet({ onOpenChange });

    act(() => {
      testRenderer.root
        .findByProps({ testID: 'action-sheet-cancel-button' })
        .props.onPress();
    });

    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: 'cancel' });
  });
});
