import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { ActionSheet } from '../src/ActionSheet';
import { DisplayInput } from '../src/DisplayInput';
import { ImagePicker } from '../src/ImagePicker';
import { pickImageFromFiles, pickImageFromLibrary } from '../src/ImagePicker/nativePickers';
import type { ImagePickerValue } from '../src/ImagePicker';

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
  props: Partial<React.ComponentProps<typeof ImagePicker>> = {},
) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(<ImagePicker {...props} />);
  });

  return testRenderer!;
}

function pressTrigger(testRenderer: renderer.ReactTestRenderer): void {
  act(() => {
    testRenderer.root.findByProps({ testID: 'image-picker-trigger' }).props.onPress();
  });
}

describe('ImagePicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders DisplayInput as readonly trigger', () => {
    const testRenderer = renderImagePicker({
      label: 'Image',
      placeholder: 'Choose image',
    });

    const triggerInput = testRenderer.root.findByType(DisplayInput);

    expect(triggerInput.props.readonly).toBe(true);
    expect(triggerInput.props.display).toBe('inline');
    expect(triggerInput.props.label).toBe('Image');
    expect(triggerInput.props.placeholder).toBe('Choose image');
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
    expect(testRenderer.root.findByType(DisplayInput).props.valueText).toBe(
      'library-image.jpg',
    );
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
