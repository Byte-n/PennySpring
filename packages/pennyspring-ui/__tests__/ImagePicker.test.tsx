import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { DisplayInput } from '../src/DisplayInput';
import { Icon } from '../src/Icon';
import { ImagePicker } from '../src/ImagePicker';
import { pickImageFromCamera, pickImageFromFiles, pickImageFromLibrary } from '../src/ImagePicker/nativePickers';
import { Popup } from '../src/Popup';
import type { ImagePickerProps, ImagePickerValue } from '../src/ImagePicker';

jest.mock('../src/ImagePicker/nativePickers', () => ({
  pickImageFromCamera: jest.fn(),
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
const mockPickImageFromCamera = jest.mocked(pickImageFromCamera);

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

  it('picks image from camera and keeps the floating panel open', async () => {
    const nextValue: ImagePickerValue = {
      uri: 'file:///camera-image.jpg',
      fileName: 'camera-image.jpg',
      mimeType: 'image/jpeg',
    };
    const onChange = jest.fn();
    mockPickImageFromCamera.mockResolvedValue(nextValue);
    const testRenderer = renderImagePicker({ onChange });

    pressTrigger(testRenderer);
    await act(async () => {
      testRenderer.root.findByProps({ testID: 'image-picker-action-camera' }).props.onPress();
    });

    expect(mockPickImageFromCamera).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(nextValue);
    expect(getStatusText(testRenderer)).toBe('已选择');
    expect(testRenderer.root.findByType(Popup.FloatingPanel).props.open).toBe(true);
    expect(JSON.stringify(testRenderer.toJSON())).toContain('camera-image.jpg');
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
      testRenderer.root.findByProps({ testID: 'image-picker-action-photo' }).props.onPress();
    });

    expect(mockPickImageFromLibrary).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(nextValue);
    expect(getStatusText(testRenderer)).toBe('已选择');
  });

  it('picks image from file system and forwards result', async () => {
    const nextValue: ImagePickerValue = {
      uri: 'file:///file-image.png',
      name: 'file-image.png',
      type: 'image/png',
    };
    const onChange = jest.fn();
    mockPickImageFromFiles.mockResolvedValue(nextValue);
    const testRenderer = renderImagePicker({
      onChange,
      sources: ['photo', 'fileSystem'],
    });

    pressTrigger(testRenderer);
    await act(async () => {
      testRenderer.root.findByProps({ testID: 'image-picker-action-fileSystem' }).props.onPress();
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
      testRenderer.root.findByProps({ testID: 'image-picker-action-photo' }).props.onPress();
    });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('reports native picker errors without changing value', async () => {
    const error = new Error('Native picker failed');
    const onChange = jest.fn();
    const onError = jest.fn();
    mockPickImageFromFiles.mockRejectedValue(error);
    const testRenderer = renderImagePicker({
      onChange,
      onError,
      sources: ['photo', 'fileSystem'],
    });

    pressTrigger(testRenderer);
    await act(async () => {
      testRenderer.root.findByProps({ testID: 'image-picker-action-fileSystem' }).props.onPress();
    });

    expect(onError).toHaveBeenCalledWith(error);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('removes selected image from the floating panel', async () => {
    const selectedValues: ImagePickerValue[] = [
      { uri: 'file:///first.jpg', fileName: 'first.jpg' },
      { uri: 'file:///second.jpg', fileName: 'second.jpg' },
    ];
    const onChange = jest.fn();
    const testRenderer = renderImagePicker({
      defaultValue: selectedValues,
      multiple: true,
      onChange,
    });

    pressTrigger(testRenderer);
    await act(async () => {
      testRenderer.root.findAllByProps({ testID: 'image-picker-remove-image' })[0].props.onPress();
    });

    expect(onChange).toHaveBeenCalledWith([selectedValues[1]]);
    expect(getStatusText(testRenderer)).toBe('已选择 1 张');
  });

  it('closes floating panel when done is pressed', async () => {
    const testRenderer = renderImagePicker();

    pressTrigger(testRenderer);
    await act(async () => {
      testRenderer.root.findByProps({ testID: 'image-picker-action-done' }).props.onPress();
    });

    expect(testRenderer.root.findByType(Popup.FloatingPanel).props.open).toBe(false);
  });

  it('does not open when disabled', () => {
    const testRenderer = renderImagePicker({ disabled: true });

    act(() => {
      testRenderer.root.findByProps({ testID: 'image-picker-trigger' }).props.onPress();
    });

    expect(testRenderer.root.findByType(Popup.FloatingPanel).props.open).toBe(false);
  });
});
