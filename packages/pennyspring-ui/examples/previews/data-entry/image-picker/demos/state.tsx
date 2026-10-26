import React from 'react';
import { Column, ImagePicker } from '@pennyspring/ui';
import type { ImagePickerValue } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export const imagePickerStateDemoTitle = 'State';

export function ImagePickerStateDemo() {
  const styles = useStyles();
  const presetValue: ImagePickerValue = {
    uri: 'file:///preset.jpg',
    fileName: 'preset.jpg',
  };

  return (
    <Column style={styles.stack}>
      <ImagePicker disabled label="Disabled" labelText="Cannot select" />
      <ImagePicker label="Readonly" labelText="Read only" readonly />
      <ImagePicker
        defaultValue={presetValue}
        label="With Default Value"
        labelText="Choose image"
      />
      <ImagePicker
        allowClear
        defaultValue={presetValue}
        helperText="Clear keeps the field empty until a new image is picked"
        label="Clearable"
        labelText="Choose image"
        size="small"
      />
      <ImagePicker
        errorText="An image is required"
        label="Error"
        labelText="Choose image"
        status="error"
      />
    </Column>
  );
}

export default ImagePickerStateDemo;
