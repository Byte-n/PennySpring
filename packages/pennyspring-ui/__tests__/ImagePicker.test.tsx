import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { ActionSheet } from '../src/ActionSheet';
import { DisplayInput } from '../src/DisplayInput';
import { Icon } from '../src/Icon';
import { ImagePicker } from '../src/ImagePicker';
import { pickImageFromFiles, pickImageFromLibrary } from '../src/ImagePicker/nativePickers';
import type { ImagePickerProps, ImagePickerValue } from '../src/ImagePicker';

jest.mock('../src/ImagePicker/nativePickers', () => ({
  pickImageFromFiles: jest.fn(),
  pickImageFromLibrary: jest.fn(),
}));

jest.mock('@react-navigation/material-top-tabs', () => ({
  createMaterialTopTabNavigator: () => ({
    Navigator: 'Navigator',
    Screen: 'Screen',
  }),
}));

const mockPickImageFromFiles = jest.mocked(pickImageFromFiles);
const mockPickImageFromLibrary = jest.mocked(pickImageFromLibrary);

function renderImagePicker(
  props: Partial<ImagePickerProps> = {},
) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(<ImagePicker {...props as ImagePickerProps} />);
  });

  return testRenderer!;
}

function pressTrigger(testRenderer: renderer.ReactTestRenderer): void {
  act(() => {
    testRenderer.root.findByProps({ testID: 'image-picker-trigger' }).props.onPress();
  });
}

function getStatusText(testRenderer: renderer.ReactTestRenderer): string {
  return testRenderer.root.findByProps({ testID: 'image-picker-status' }).props.children;
}

describe('ImagePicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders fixed icon trigger with empty selected state', () => {
    const testRenderer = renderImagePicker({
      label: 'Image',
      placeholder: 'Choose image',
    });

    const icon = testRenderer.root.findByType(Icon);

    expect(icon.props.icon).toBe('image');
    expect(getStatusText(testRenderer)).toBe('未选择');
    expect(() => testRenderer.root.findByType(DisplayInput)).toThrow();
  });

  it('renders selected state for a single selected image', () => {
    const testRenderer = renderImagePicker({
      value: {
        uri: 'file:///selected.jpg',
        fileName: 'selected.jpg',
      },
    });

    expect(getStatusText(testRenderer)).toBe('已选择');
  });

  it('renders selected count when multiple images are selected', () => {
    const selectedValues: ImagePickerValue[] = [
      { uri: 'file:///first.jpg', fileName: 'first.jpg' },
      { uri: 'file:///second.jpg', fileName: 'second.jpg' },
    ];
    const testRenderer = renderImagePicker({
      multiple: true,
      value: selectedValues,
    });

    expect(getStatusText(testRenderer)).toBe('已选择 2 张');
  });

  it('opens source actions from trigger', () => {
    const testRenderer = renderImagePicker();

    pressTrigger(testRenderer);

    const actionSheet = testRenderer.root.findByType(ActionSheet);

    expect(actionSheet.props.open).toBe(true);
    expect(actionSheet.props.actions).toEqual([
      { text: '相册' },
      { text: '文件' },
    ]);
  });

  it('picks image from photo library and updates uncontrolled value', async () => {
    const nextValue: ImagePickerValue = {
      uri: 'file:///library-image.jpg',
      fileName: 'library-image.jpg',
      mimeType: 'image/jpeg',
    };
    const onChange = jest.fn();
    mockPickImageFromLibrary.mockResolvedValue(nextValue);
    const testRenderer = renderImagePicker({ onChange });

    pressTrigger(testRenderer);
    await act(async () => {
      testRenderer.root.findByType(ActionSheet).props.onAction(
        { text: 'Photo Library' },
        0,
      );
    });

    expect(mockPickImageFromLibrary).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(nextValue);
    expect(getStatusText(testRenderer)).toBe('已选择');
  });

  it('picks multiple images from photo library and updates selected count', async () => {
    const nextValues: ImagePickerValue[] = [
      {
        uri: 'file:///library-image.jpg',
        fileName: 'library-image.jpg',
        mimeType: 'image/jpeg',
      },
      {
        uri: 'file:///second-library-image.jpg',
        fileName: 'second-library-image.jpg',
        mimeType: 'image/jpeg',
      },
    ];
    const onChange = jest.fn();
    mockPickImageFromLibrary.mockResolvedValue(nextValues);
    const testRenderer = renderImagePicker({ multiple: true, onChange });

    pressTrigger(testRenderer);
    await act(async () => {
      testRenderer.root.findByType(ActionSheet).props.onAction(
        { text: 'Photo Library' },
        0,
      );
    });

    expect(mockPickImageFromLibrary).toHaveBeenCalledWith({
      maxCount: 9,
      multiple: true,
    });
    expect(onChange).toHaveBeenCalledWith(nextValues);
    expect(getStatusText(testRenderer)).toBe('已选择 2 张');
  });

  it('picks image from file system and forwards result', async () => {
    const nextValue: ImagePickerValue = {
      uri: 'file:///file-image.png',
      name: 'file-image.png',
      type: 'image/png',
    };
    const onChange = jest.fn();
    mockPickImageFromFiles.mockResolvedValue(nextValue);
    const testRenderer = renderImagePicker({ onChange });

    pressTrigger(testRenderer);
    await act(async () => {
      testRenderer.root.findByType(ActionSheet).props.onAction(
        { text: 'Files' },
        1,
      );
    });

    expect(mockPickImageFromFiles).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(nextValue);
  });

  it('does not change when native picker is cancelled', async () => {
    const onChange = jest.fn();
    mockPickImageFromLibrary.mockResolvedValue(undefined);
    const testRenderer = renderImagePicker({ onChange });

    pressTrigger(testRenderer);
    await act(async () => {
      testRenderer.root.findByType(ActionSheet).props.onAction(
        { text: 'Photo Library' },
        0,
      );
    });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('reports native picker errors without changing value', async () => {
    const error = new Error('Native picker failed');
    const onChange = jest.fn();
    const onError = jest.fn();
    mockPickImageFromFiles.mockRejectedValue(error);
    const testRenderer = renderImagePicker({ onChange, onError });

    pressTrigger(testRenderer);
    await act(async () => {
      testRenderer.root.findByType(ActionSheet).props.onAction(
        { text: 'Files' },
        1,
      );
    });

    expect(onError).toHaveBeenCalledWith(error);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not open when disabled', () => {
    const testRenderer = renderImagePicker({ disabled: true });

    act(() => {
      testRenderer.root.findByProps({ testID: 'image-picker-trigger' }).props.onPress();
    });

    expect(testRenderer.root.findByType(ActionSheet).props.open).toBe(false);
  });
});
