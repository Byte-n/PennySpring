import React from 'react';
import { StyleSheet } from 'react-native';
import { defaultSeedToken } from '@pennyspring/theme';
import { derivative } from '@pennyspring/theme/src/algorithms/derivative';
import { formatToken } from '@pennyspring/theme/src/algorithms/formatToken';
import renderer, { act } from 'react-test-renderer';
import { Column } from '../src/Column';
import { DisplayInput } from '../src/DisplayInput';
import { Grid } from '../src/Grid';
import { ImagePicker } from '../src/ImagePicker';
import { pickImageFromCamera, pickImageFromFiles, pickImageFromLibrary } from '../src/ImagePicker/nativePickers';
import { Popup } from '../src/Popup';
import { Row } from '../src/Row';
import type { ImagePickerProps, ImagePickerValue } from '../src/ImagePicker';

jest.mock('../src/ImagePicker/nativePickers', () => ({
  pickImageFromCamera: jest.fn(),
  pickImageFromFiles: jest.fn(),
  pickImageFromLibrary: jest.fn(),
}));


const mockPickImageFromFiles = jest.mocked(pickImageFromFiles);
const mockPickImageFromLibrary = jest.mocked(pickImageFromLibrary);
const mockPickImageFromCamera = jest.mocked(pickImageFromCamera);
const token = formatToken(derivative(defaultSeedToken, false));

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
    testRenderer.root.findByType(DisplayInput).props.onPress();
  });
}

function getStatusText(testRenderer: renderer.ReactTestRenderer): string {
  return testRenderer.root.findByType(DisplayInput).props.valueText;
}

describe('ImagePicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  it('uses layout components for panel header and selected image grid', () => {
    const selectedValues: ImagePickerValue[] = [
      { uri: 'file:///first.jpg', fileName: 'first.jpg' },
      { uri: 'file:///second.jpg', fileName: 'second.jpg' },
    ];
    const testRenderer = renderImagePicker({
      defaultValue: selectedValues,
      multiple: true,
    });

    pressTrigger(testRenderer);

    expect(testRenderer.root.findAllByType(Row).length).toBeGreaterThan(0);
    expect(testRenderer.root.findAllByType(Column).length).toBeGreaterThan(0);
    expect(testRenderer.root.findAllByType(Grid).length).toBeGreaterThan(0);
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

  it('keeps remove button visual size separate from a token based hit area', () => {
    const selectedValues: ImagePickerValue[] = [
      { uri: 'file:///first.jpg', fileName: 'first.jpg' },
    ];
    const testRenderer = renderImagePicker({
      defaultValue: selectedValues,
      multiple: true,
    });

    pressTrigger(testRenderer);

    const removeButton = testRenderer.root.findByProps({
      testID: 'image-picker-remove-image',
    });
    const removeButtonStyle = StyleSheet.flatten(removeButton.props.style);
    const expectedHitSlop = (token.controlHeight - token.sizeLG) / 2;

    expect(removeButtonStyle.width).toBe(token.sizeLG);
    expect(removeButton.props.hitSlop).toEqual({
      bottom: expectedHitSlop,
      left: expectedHitSlop,
      right: expectedHitSlop,
      top: expectedHitSlop,
    });
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

    pressTrigger(testRenderer);

    expect(testRenderer.root.findByType(DisplayInput).props.disabled).toBe(true);
    expect(testRenderer.root.findByType(Popup.FloatingPanel).props.open).toBe(false);
  });

  it('does not open when readonly', () => {
    const testRenderer = renderImagePicker({ readonly: true });

    pressTrigger(testRenderer);

    expect(testRenderer.root.findByType(DisplayInput).props.readonly).toBe(true);
    expect(testRenderer.root.findByType(Popup.FloatingPanel).props.open).toBe(false);
  });

  it('clears the selected image when allowClear is pressed', () => {
    const onChange = jest.fn();
    const onClear = jest.fn();
    const testRenderer = renderImagePicker({
      allowClear: true,
      defaultValue: { uri: 'file:///first.jpg' },
      onChange,
      onClear,
    });

    act(() => {
      testRenderer.root
        .findByProps({ testID: 'picker-trigger-clear-button' })
        .props.onPress();
    });

    expect(onClear).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(undefined);
    expect(getStatusText(testRenderer)).toBeUndefined();
  });

  it('hides the clear button when readonly', () => {
    const testRenderer = renderImagePicker({
      allowClear: true,
      defaultValue: { uri: 'file:///first.jpg' },
      readonly: true,
    });

    expect(
      testRenderer.root.findAllByProps({ testID: 'picker-trigger-clear-button' }),
    ).toHaveLength(0);
  });

  it('does not render remove buttons in readonly mode even when open', () => {
    const testRenderer = renderImagePicker({
      defaultValue: [{ uri: 'file:///first.jpg' }],
      multiple: true,
      open: true,
      readonly: true,
    });

    expect(
      testRenderer.root.findAllByProps({ testID: 'image-picker-remove-image' }),
    ).toHaveLength(0);
  });

  it('passes size to the display input trigger', () => {
    const testRenderer = renderImagePicker({ size: 'small' });

    expect(testRenderer.root.findByType(DisplayInput).props.size).toBe('small');
  });

  it('does not inject field styles or disabled visuals into the trigger', () => {
    const testRenderer = renderImagePicker({
      defaultValue: { uri: 'file:///first.jpg' },
      disabled: true,
    });
    const triggerInput = testRenderer.root.findByType(DisplayInput);

    expect(triggerInput.props.styles?.field).toBeUndefined();
    expect(triggerInput.props.styles?.value).toBeUndefined();
  });
});
